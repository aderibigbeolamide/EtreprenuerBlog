import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";
import { getStorage } from "./storage";
import { insertBlogPostSchema, insertCommentSchema, insertStaffSchema } from "@shared/schema";
import { generateBlogContent, analyzeImage } from "./openai";
import { 
  upload, 
  uploadToCloudinary, 
  uploadMultipleToCloudinary, 
  deleteFromCloudinary,
  getOptimizedImageUrl,
  getOptimizedVideoUrl 
} from "./cloudinary";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireAdminAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.user.role !== 'admin' || !req.user.isApproved) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

function requireApprovedAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (!req.user.isApproved) {
    return res.status(403).json({ message: "Account pending approval" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      // Set appropriate MIME types for different file types
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.mp4') {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (ext === '.webm') {
        res.setHeader('Content-Type', 'video/webm');
      } else if (ext === '.ogg') {
        res.setHeader('Content-Type', 'video/ogg');
      } else if (ext === '.avi') {
        res.setHeader('Content-Type', 'video/x-msvideo');
      } else if (ext === '.mov') {
        res.setHeader('Content-Type', 'video/quicktime');
      }
      
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
      
      const storage = await getStorage();
      const posts = await storage.getAllBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      const post = await storage.getBlogPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Public staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const storage = await getStorage();
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
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      
      const storage = await getStorage();
      const comments = await storage.getCommentsByPostId(postId, parentId);
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
      
      const storage = await getStorage();
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // User management routes (admin only)
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const users = await storage.getAllUsers();
      // Don't send passwords in response
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id/approve", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      const user = await storage.approveUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const safeUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      
      // Prevent deleting the seed admin
      const user = await storage.getUser(id);
      if (user && user.username === 'admin') {
        return res.status(403).json({ message: "Cannot delete seed admin user" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin-only routes
  app.get("/api/admin/blog-posts", requireAdminAuth, async (req, res) => {
    try {
      const { search, authorName } = req.query;
      const filters = {
        search: search as string,
        authorName: authorName as string,
        published: undefined // Show all posts for admin
      };
      
      const storage = await getStorage();
      const posts = await storage.getAllBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog-posts", requireAdminAuth, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];
      
      // Upload images to Cloudinary
      if (files?.images && files.images.length > 0) {
        const imageUploads = await uploadMultipleToCloudinary(files.images, {
          folder: 'blog-posts/images',
          resource_type: 'image'
        });
        imageUrls = imageUploads.map(upload => upload.secure_url);
      }
      
      // Upload videos to Cloudinary
      if (files?.videos && files.videos.length > 0) {
        const videoUploads = await uploadMultipleToCloudinary(files.videos, {
          folder: 'blog-posts/videos',
          resource_type: 'video'
        });
        videoUrls = videoUploads.map(upload => upload.secure_url);
      }

      const postData = insertBlogPostSchema.parse({
        ...req.body,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        videoUrls: videoUrls.length > 0 ? videoUrls : null,
        isPublished: req.body.isPublished === 'true',
        isAiGenerated: req.body.isAiGenerated === 'true'
      });

      const storage = await getStorage();
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog-posts/:id", requireAdminAuth, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      let updateData = { ...req.body };
      
      // Upload new images to Cloudinary if provided
      if (files?.images && files.images.length > 0) {
        const imageUploads = await uploadMultipleToCloudinary(files.images, {
          folder: 'blog-posts/images',
          resource_type: 'image'
        });
        updateData.imageUrls = imageUploads.map(upload => upload.secure_url);
      }
      
      // Upload new videos to Cloudinary if provided
      if (files?.videos && files.videos.length > 0) {
        const videoUploads = await uploadMultipleToCloudinary(files.videos, {
          folder: 'blog-posts/videos',
          resource_type: 'video'
        });
        updateData.videoUrls = videoUploads.map(upload => upload.secure_url);
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

      const storage = await getStorage();
      const post = await storage.updateBlogPost(id, updateData);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog-posts/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
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
  app.post("/api/admin/generate-content", requireAdminAuth, upload.single('image'), async (req, res) => {
    try {
      const { headline } = req.body;
      
      if (!headline) {
        return res.status(400).json({ message: "Headline is required" });
      }

      let imageBase64: string | undefined;
      
      if (req.file) {
        // Use the file buffer directly from memory storage
        imageBase64 = req.file.buffer.toString('base64');
      }

      const generatedContent = await generateBlogContent(headline, imageBase64);
      
      res.json(generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Staff management (admin only)
  app.post("/api/admin/staff", requireAdminAuth, upload.single('image'), async (req, res) => {
    try {
      let imageUrl = req.body.imageUrl || null;
      
      if (req.file) {
        // Upload staff image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: 'staff-images',
          resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
      }

      const staffData = insertStaffSchema.parse({
        ...req.body,
        imageUrl,
        isActive: req.body.isActive === 'true'
      });

      const storage = await getStorage();
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      res.status(400).json({ message: "Failed to create staff member" });
    }
  });

  app.put("/api/admin/staff/:id", requireAdminAuth, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let updateData = { ...req.body };
      
      if (req.file) {
        // Upload updated staff image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: 'staff-images',
          resource_type: 'image'
        });
        updateData.imageUrl = uploadResult.secure_url;
      }

      const storage = await getStorage();
      const staff = await storage.updateStaff(id, updateData);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(staff);
    } catch (error) {
      res.status(400).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/admin/staff/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
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
  app.put("/api/admin/comments/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      const comment = await storage.updateComment(id, req.body);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/admin/comments/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      const success = await storage.deleteComment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // File upload endpoints for Cloudinary
  app.post("/api/admin/upload-image", requireAdminAuth, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'uploads/images',
        resource_type: 'image'
      });

      res.json({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        optimizedUrl: getOptimizedImageUrl(uploadResult.public_id)
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.post("/api/admin/upload-video", requireAdminAuth, upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'uploads/videos',
        resource_type: 'video'
      });

      res.json({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        optimizedUrl: getOptimizedVideoUrl(uploadResult.public_id)
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
