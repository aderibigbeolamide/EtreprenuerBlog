import { 
  users, staff, blogPosts, comments,
  type User, type InsertUser,
  type Staff, type InsertStaff,
  type BlogPost, type InsertBlogPost, type BlogPostWithAuthor,
  type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Staff methods
  getAllStaff(): Promise<Staff[]>;
  getStaffById(id: number): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;

  // Blog post methods
  getAllBlogPosts(filters?: { search?: string; authorId?: number; published?: boolean }): Promise<BlogPostWithAuthor[]>;
  getBlogPostById(id: number): Promise<BlogPostWithAuthor | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;

  // Comment methods
  getCommentsByPostId(postId: number, parentId?: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private staff: Map<number, Staff> = new Map();
  private blogPosts: Map<number, BlogPost> = new Map();
  private comments: Map<number, Comment> = new Map();
  private userIdCounter = 1;
  private staffIdCounter = 1;
  private blogPostIdCounter = 1;
  private commentIdCounter = 1;

  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new session.MemoryStore();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      ...insertUser,
      role: insertUser.role || 'admin'
    };
    this.users.set(user.id, user);
    return user;
  }

  // Staff methods
  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(s => s.isActive);
  }

  async getStaffById(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const staff: Staff = {
      id: this.staffIdCounter++,
      ...staffData,
      isActive: true
    };
    this.staff.set(staff.id, staff);
    return staff;
  }

  async updateStaff(id: number, staffData: Partial<InsertStaff>): Promise<Staff | undefined> {
    const existing = this.staff.get(id);
    if (!existing) return undefined;
    
    const updated: Staff = {
      ...existing,
      ...staffData,
      isActive: staffData.isActive ?? existing.isActive
    };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaff(id: number): Promise<boolean> {
    const existing = this.staff.get(id);
    if (!existing) return false;
    
    this.staff.set(id, { ...existing, isActive: false });
    return true;
  }

  // Blog post methods
  async getAllBlogPosts(filters?: { search?: string; authorName?: string; published?: boolean }): Promise<BlogPostWithAuthor[]> {
    let posts = Array.from(this.blogPosts.values());
    
    if (filters?.published !== undefined) {
      posts = posts.filter(p => p.isPublished === filters.published);
    }
    
    if (filters?.authorName) {
      posts = posts.filter(p => p.authorName.toLowerCase().includes(filters.authorName!.toLowerCase()));
    }
    
    if (filters?.search) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        p.content.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return posts.map(post => ({
      ...post,
      comments: Array.from(this.comments.values()).filter(c => c.postId === post.id)
    }));
  }

  async getBlogPostById(id: number): Promise<BlogPostWithAuthor | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const comments = Array.from(this.comments.values()).filter(c => c.postId === id);
    return {
      ...post,
      comments
    };
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const blogPost: BlogPost = {
      id: this.blogPostIdCounter++,
      ...post,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogPosts.set(blogPost.id, blogPost);
    return blogPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const existing = this.blogPosts.get(id);
    if (!existing) return undefined;
    
    const updated: BlogPost = {
      ...existing,
      ...post,
      updatedAt: new Date()
    };
    this.blogPosts.set(id, updated);
    return updated;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  // Comment methods
  async getCommentsByPostId(postId: number, parentId?: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.postId === postId && c.isApproved)
      .filter(c => parentId !== undefined ? c.parentId === parentId : !c.parentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: this.commentIdCounter++,
      ...comment,
      isApproved: true,
      createdAt: new Date()
    };
    this.comments.set(newComment.id, newComment);
    return newComment;
  }

  async updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined> {
    const existing = this.comments.get(id);
    if (!existing) return undefined;
    
    const updated: Comment = {
      ...existing,
      ...comment
    };
    this.comments.set(id, updated);
    return updated;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Staff methods
  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.isActive, true));
  }

  async getStaffById(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [staffMember] = await db
      .insert(staff)
      .values(staffData)
      .returning();
    return staffMember;
  }

  async updateStaff(id: number, staffData: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [staffMember] = await db
      .update(staff)
      .set({ ...staffData, isActive: staffData.isActive ?? true })
      .where(eq(staff.id, id))
      .returning();
    return staffMember || undefined;
  }

  async deleteStaff(id: number): Promise<boolean> {
    const [deleted] = await db
      .update(staff)
      .set({ isActive: false })
      .where(eq(staff.id, id))
      .returning();
    return !!deleted;
  }

  // Blog post methods
  async getAllBlogPosts(filters?: { search?: string; authorName?: string; published?: boolean }): Promise<BlogPostWithAuthor[]> {
    const conditions = [];
    
    if (filters?.published !== undefined) {
      conditions.push(eq(blogPosts.isPublished, filters.published));
    }
    
    if (filters?.authorName) {
      conditions.push(ilike(blogPosts.authorName, `%${filters.authorName}%`));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${filters.search}%`),
          ilike(blogPosts.content, `%${filters.search}%`)
        )
      );
    }

    const query = db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt));

    const results = await query;
    
    return results.map(row => ({
      ...row,
      comments: [] // Comments will be loaded separately when needed
    }));
  }

  async getBlogPostById(id: number): Promise<BlogPostWithAuthor | undefined> {
    const [result] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));

    if (!result) return undefined;

    try {
      const postComments = await this.getCommentsByPostId(id);
      
      return {
        ...result,
        comments: postComments
      };
    } catch (error) {
      console.error("Error fetching comments for blog post:", error);
      // Return post without comments if comment fetching fails
      return {
        ...result,
        comments: []
      };
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [blogPost] = await db
      .insert(blogPosts)
      .values({
        ...post,
        updatedAt: new Date()
      })
      .returning();
    return blogPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [blogPost] = await db
      .update(blogPosts)
      .set({
        ...post,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return blogPost || undefined;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    return !!deleted;
  }

  // Comment methods
  async getCommentsByPostId(postId: number, parentId?: number): Promise<Comment[]> {
    try {
      let conditions = [eq(comments.postId, postId), eq(comments.isApproved, true)];
      
      if (parentId !== undefined) {
        conditions.push(eq(comments.parentId, parentId));
      } else {
        // Get only top-level comments (no parent)
        conditions.push(isNull(comments.parentId));
      }
      
      return await db
        .select()
        .from(comments)
        .where(and(...conditions))
        .orderBy(desc(comments.createdAt));
    } catch (error) {
      console.error("Error in getCommentsByPostId:", error);
      // Return empty array if there's an error
      return [];
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set(comment)
      .where(eq(comments.id, id))
      .returning();
    return updatedComment || undefined;
  }

  async deleteComment(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return !!deleted;
  }
}

// Create storage instance based on database availability
let storage: IStorage;

try {
  // Try to use DatabaseStorage if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    storage = new DatabaseStorage();
  } else {
    throw new Error("No DATABASE_URL provided");
  }
} catch (error) {
  console.warn("Database not available, using in-memory storage:", (error as Error).message);
  // Fallback to memory storage if database is not available
  storage = new MemStorage();
}

export { storage };
