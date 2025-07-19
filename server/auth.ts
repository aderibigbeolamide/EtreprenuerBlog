import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getStorage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { config } from "./config";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  const storage = await getStorage();
  const sessionSettings: session.SessionOptions = {
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const storage = await getStorage();
      // Trim whitespace from username and password
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      const user = await storage.getUserByUsername(trimmedUsername);
      if (!user || !(await comparePasswords(trimmedPassword, user.password))) {
        return done(null, false);
      } else if (!user.isApproved && user.role !== 'admin') {
        return done(null, false, { message: 'Account pending approval' });
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const storage = await getStorage();
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/auth/register", async (req, res, next) => {
    const storage = await getStorage();
    
    // Trim whitespace from input data
    const trimmedUsername = req.body.username?.trim();
    const trimmedPassword = req.body.password?.trim();
    
    // Validate trimmed inputs
    if (!trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const existingUser = await storage.getUserByUsername(trimmedUsername);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = await storage.createUser({
      ...req.body,
      username: trimmedUsername,
      password: await hashPassword(trimmedPassword),
    });

    // Only auto-login admin users or approved users
    if (user.role === 'admin' || user.isApproved) {
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          message: "Registration successful", 
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            isApproved: user.isApproved
          }
        });
      });
    } else {
      // Don't auto-login, return success message
      res.status(201).json({ 
        message: "Registration successful. Your account is pending approval from an administrator.",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isApproved: user.isApproved
        }
      });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
