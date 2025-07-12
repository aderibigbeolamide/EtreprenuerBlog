import { 
  users, staff, blogPosts, comments,
  type User, type InsertUser,
  type Staff, type InsertStaff,
  type BlogPost, type InsertBlogPost, type BlogPostWithAuthor,
  type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or } from "drizzle-orm";
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
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;

  sessionStore: session.Store;
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
  async getAllBlogPosts(filters?: { search?: string; authorId?: number; published?: boolean }): Promise<BlogPostWithAuthor[]> {
    const conditions = [];
    
    if (filters?.published !== undefined) {
      conditions.push(eq(blogPosts.isPublished, filters.published));
    }
    
    if (filters?.authorId) {
      conditions.push(eq(blogPosts.authorId, filters.authorId));
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
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        excerpt: blogPosts.excerpt,
        imageUrls: blogPosts.imageUrls,
        videoUrls: blogPosts.videoUrls,
        authorId: blogPosts.authorId,
        isPublished: blogPosts.isPublished,
        isAiGenerated: blogPosts.isAiGenerated,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: staff,
      })
      .from(blogPosts)
      .leftJoin(staff, eq(blogPosts.authorId, staff.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt));

    const results = await query;
    
    return results.map(row => ({
      ...row,
      author: row.author!,
      comments: [] // Comments will be loaded separately when needed
    }));
  }

  async getBlogPostById(id: number): Promise<BlogPostWithAuthor | undefined> {
    const [result] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        excerpt: blogPosts.excerpt,
        imageUrls: blogPosts.imageUrls,
        videoUrls: blogPosts.videoUrls,
        authorId: blogPosts.authorId,
        isPublished: blogPosts.isPublished,
        isAiGenerated: blogPosts.isAiGenerated,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: staff,
      })
      .from(blogPosts)
      .leftJoin(staff, eq(blogPosts.authorId, staff.id))
      .where(eq(blogPosts.id, id));

    if (!result) return undefined;

    const postComments = await this.getCommentsByPostId(id);

    return {
      ...result,
      author: result.author!,
      comments: postComments
    };
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
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));
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

export const storage = new DatabaseStorage();
