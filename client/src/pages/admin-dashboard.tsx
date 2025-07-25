import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BlogForm from "@/components/admin/blog-form";
import BlogManagement from "@/components/admin/blog-management";
import StaffForm from "@/components/admin/staff-form";
import StaffManagement from "@/components/admin/staff-management";
import UserManagement from "@/components/admin/user-management";
import { 
  PlusCircle, 
  FileText, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Bot,
  Calendar
} from "lucide-react";
import type { BlogPostWithAuthor, Staff, Comment } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: allPosts, isLoading: postsLoading } = useQuery<BlogPostWithAuthor[]>({
    queryKey: ['/api/admin/blog-posts'],
  });

  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const publishedPosts = allPosts?.filter(post => post.isPublished) || [];
  const draftPosts = allPosts?.filter(post => !post.isPublished) || [];
  const aiGeneratedPosts = allPosts?.filter(post => post.isAiGenerated) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, {user?.username}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="w-full sm:w-auto text-sm"
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 text-xs sm:text-sm overflow-x-auto">
            <TabsTrigger value="overview" className="px-2 sm:px-3">Overview</TabsTrigger>
            <TabsTrigger value="posts" className="px-2 sm:px-3">Posts</TabsTrigger>
            <TabsTrigger value="manage" className="px-2 sm:px-3 hidden sm:block">Manage</TabsTrigger>
            <TabsTrigger value="create" className="px-2 sm:px-3">Create</TabsTrigger>
            <TabsTrigger value="staff" className="px-2 sm:px-3 hidden lg:block">Staff</TabsTrigger>
            <TabsTrigger value="add-staff" className="px-2 sm:px-3 hidden lg:block">Add Staff</TabsTrigger>
            <TabsTrigger value="users" className="px-2 sm:px-3 hidden lg:block">Users</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Posts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {postsLoading ? "..." : allPosts?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 text-accent" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">AI Generated</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {postsLoading ? "..." : aiGeneratedPosts.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {postsLoading ? "..." : publishedPosts.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Staff Members</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {staffLoading ? "..." : staff?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allPosts && allPosts.length > 0 ? (
                  <div className="space-y-4">
                    {allPosts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {post.imageUrl ? (
                            <img 
                              src={post.imageUrl} 
                              alt={post.title}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{post.title}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(post.createdAt)}</span>
                              {post.isAiGenerated && (
                                <Badge variant="secondary" className="bg-accent bg-opacity-10 text-accent">
                                  <Bot className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                              <Badge variant={post.isPublished ? "default" : "secondary"}>
                                {post.isPublished ? "Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/blog/${post.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No blog posts yet. Create your first post!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Management Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Manage Blog Posts</h2>
              <Button onClick={() => setActiveTab("create")} className="bg-accent hover:bg-orange-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Post
              </Button>
            </div>

            {postsLoading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-4" />
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allPosts && allPosts.length > 0 ? (
              <div className="grid gap-6">
                {allPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                            {post.isAiGenerated && (
                              <Badge variant="secondary" className="bg-accent bg-opacity-10 text-accent">
                                <Bot className="h-3 w-3 mr-1" />
                                AI Generated
                              </Badge>
                            )}
                            <Badge variant={post.isPublished ? "default" : "secondary"}>
                              {post.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{post.excerpt}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>By {post.author?.name}</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link href={`/blog/${post.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first blog post</p>
                  <Button onClick={() => setActiveTab("create")} className="bg-accent hover:bg-orange-600">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Manage Posts Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Blog Posts</h2>
              <p className="text-gray-600">Edit and delete existing blog posts.</p>
            </div>
            <BlogManagement />
          </TabsContent>

          {/* Create Post Tab */}
          <TabsContent value="create" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Blog Post</h2>
              <p className="text-gray-600">Use AI to generate content from a headline and image, or create manually.</p>
            </div>
            <BlogForm />
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            <StaffManagement />
          </TabsContent>

          {/* Add Staff Tab */}
          <TabsContent value="add-staff" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Staff Member</h2>
              <p className="text-gray-600">Add a new team member to your organization.</p>
            </div>
            <StaffForm />
          </TabsContent>

          {/* Manage Staff Tab */}
          <TabsContent value="manage-staff" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Staff</h2>
              <p className="text-gray-600">Edit and delete staff members.</p>
            </div>
            <StaffManagement />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
              <p className="text-gray-600">Approve and manage user registrations.</p>
            </div>
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
