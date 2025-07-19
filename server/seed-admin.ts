import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { getStorage } from "./storage";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  const adminUsername = "admin";
  const adminPassword = "admin123";
  
  try {
    const storage = await getStorage();
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername(adminUsername);
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }
    
    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    const adminUser = await storage.createUser({
      username: adminUsername,
      password: hashedPassword
    });
    
    console.log(`Admin user created successfully: ${adminUser.username}`);
    console.log(`Login with username: ${adminUsername} and password: ${adminPassword}`);
    
    // Create sample staff member if none exists
    const existingStaff = await storage.getAllStaff();
    if (existingStaff.length === 0) {
      await storage.createStaff({
        name: "Admin User",
        role: "Administrator",
        bio: "System Administrator",
        imageUrl: null,
        email: "admin@example.com",
        linkedinUrl: null,
        isActive: true
      });
      console.log("Sample staff member created");
    }
    
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}

export { seedAdmin };