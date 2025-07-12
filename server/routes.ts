import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBlogPostSchema, insertCommentSchema, insertStaffSchema } from "@shared/schema";
import { generateBlogContent, analyzeImage } from "./openai";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image uploads'));
      }
    } else if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video uploads'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Public blog routes
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const { search, authorName, published = "true" } = req.query;
      const filters = {
        search: search as string,
        authorName: authorName as string,
        published: published === "true"
      };
      
      const posts = await storage.getAllBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Public staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staffMembers = await storage.getAllStaff();
      res.json(staffMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff members" });
    }
  });

  // Public comment routes
  app.get("/api/blog-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/blog-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // Admin-only routes
  app.get("/api/admin/blog-posts", requireAuth, async (req, res) => {
    try {
      const { search, authorName } = req.query;
      const filters = {
        search: search as string,
        authorName: authorName as string,
        published: undefined // Show all posts for admin
      };
      
      const posts = await storage.getAllBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog-posts", requireAuth, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];
      
      if (files?.images) {
        imageUrls = files.images.map(file => `/uploads/${file.filename}`);
      }
      
      if (files?.videos) {
        videoUrls = files.videos.map(file => `/uploads/${file.filename}`);
      }

      const postData = insertBlogPostSchema.parse({
        ...req.body,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        videoUrls: videoUrls.length > 0 ? videoUrls : null,
        isPublished: req.body.isPublished === 'true',
        isAiGenerated: req.body.isAiGenerated === 'true'
      });

      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog-posts/:id", requireAuth, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      let updateData = { ...req.body };
      
      if (files?.image?.[0]) {
        updateData.imageUrl = `/uploads/${files.image[0].filename}`;
      }
      
      if (files?.video?.[0]) {
        updateData.videoUrl = `/uploads/${files.video[0].filename}`;
      }

      if (updateData.authorId) {
        updateData.authorId = parseInt(updateData.authorId);
      }
      
      if (updateData.isPublished !== undefined) {
        updateData.isPublished = updateData.isPublished === 'true';
      }
      
      if (updateData.isAiGenerated !== undefined) {
        updateData.isAiGenerated = updateData.isAiGenerated === 'true';
      }

      const post = await storage.updateBlogPost(id, updateData);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog-posts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // AI content generation
  app.post("/api/admin/generate-content", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const { headline } = req.body;
      
      if (!headline) {
        return res.status(400).json({ message: "Headline is required" });
      }

      let imageBase64: string | undefined;
      
      if (req.file) {
        const imageBuffer = fs.readFileSync(req.file.path);
        imageBase64 = imageBuffer.toString('base64');
      }

      const generatedContent = await generateBlogContent(headline, imageBase64);
      
      res.json(generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Staff management (admin only)
  app.post("/api/admin/staff", requireAuth, upload.single('image'), async (req, res) => {
    try {
      let imageUrl = req.body.imageUrl || null;
      
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const staffData = insertStaffSchema.parse({
        ...req.body,
        imageUrl,
        isActive: req.body.isActive === 'true'
      });

      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      res.status(400).json({ message: "Failed to create staff member" });
    }
  });

  app.put("/api/admin/staff/:id", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let updateData = { ...req.body };
      
      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }

      const staff = await storage.updateStaff(id, updateData);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(staff);
    } catch (error) {
      res.status(400).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/admin/staff/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStaff(id);
      
      if (!success) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Comment moderation (admin only)
  app.put("/api/admin/comments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.updateComment(id, req.body);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/admin/comments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteComment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
