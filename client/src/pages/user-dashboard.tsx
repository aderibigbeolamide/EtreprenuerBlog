import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Mail,
  Linkedin,
  Clock,
  Check,
  Home,
  Upload,
  Users,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertStaffSchema, insertBlogPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function UserDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Redirect if not logged in or not approved
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  if (!user.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle>Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your account is waiting for admin approval. Please contact the administrator 
              to approve your account, or wait for email notification.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button onClick={() => logoutMutation.mutate()} variant="ghost">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect admin users to admin dashboard
  if (user.role === 'admin') {
    return <Redirect to="/admin" />;
  }

  return <UserDashboardContent user={user} />;
}

function UserDashboardContent({ user }: { user: any }) {
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch user's staff profile
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff", "user", user.id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/staff/user/${user.id}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      } catch (error) {
        return null;
      }
    },
  });

  // Fetch user's blog posts
  const { data: blogPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/blog-posts", "user", user.username],
    queryFn: async () => {
      const res = await fetch(`/api/blog-posts?authorName=${encodeURIComponent(user.username)}&published=all`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">User Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.username}!</p>
              </div>
            </div>
            <Button onClick={() => logoutMutation.mutate()} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Blogs
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Blog
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab staff={staff} user={user} staffLoading={staffLoading} />
          </TabsContent>

          <TabsContent value="blogs">
            <BlogsTab blogPosts={blogPosts} postsLoading={postsLoading} user={user} />
          </TabsContent>

          <TabsContent value="create">
            <CreateBlogTab user={user} />
          </TabsContent>

          <TabsContent value="staff">
            <AllStaffTab user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileTab({ staff, user, staffLoading }: any) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!staff); // Auto-edit if no profile exists
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: staff?.name || user.username,
    role: staff?.role || "",
    bio: staff?.bio || "",
    email: staff?.email || "",
    linkedinUrl: staff?.linkedinUrl || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const createStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      formData.append('userId', user.id.toString());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch("/api/staff", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create profile");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Profile created successfully!" });
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch(`/api/staff/${staff.id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Profile updated successfully!" });
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staff) {
      updateStaffMutation.mutate(formData);
    } else {
      createStaffMutation.mutate(formData);
    }
  };

  if (staffLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Staff Profile
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {staff ? "Manage your staff profile information" : "Create your staff profile to be featured on the team page"}
            </p>
          </div>
          {staff && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {imagePreview || staff?.imageUrl ? (
                    <img 
                      src={imagePreview || staff?.imageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-sm text-gray-600">Click to upload profile image</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role/Position</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Lecturer, Research Assistant"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Write a brief bio about yourself, your expertise, and your role in the centre..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {staff ? "Update Profile" : "Create Profile"}
              </Button>
              {staff && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: staff.name,
                      role: staff.role,
                      bio: staff.bio,
                      email: staff.email || "",
                      linkedinUrl: staff.linkedinUrl || "",
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : staff ? (
          <div className="space-y-4">
            {/* Display Profile Image */}
            {staff.imageUrl && (
              <div className="flex justify-center mb-6">
                <img 
                  src={staff.imageUrl} 
                  alt={staff.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Name</Label>
                <p className="text-sm">{staff.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <p className="text-sm">{staff.role}</p>
              </div>
              {staff.email && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {staff.email}
                  </p>
                </div>
              )}
              {staff.linkedinUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">LinkedIn</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    <a href={staff.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Profile
                    </a>
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Bio</Label>
              <p className="text-sm mt-1 leading-relaxed">{staff.bio}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No staff profile created yet. Click "Create Profile" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BlogsTab({ blogPosts, postsLoading, user }: any) {
  const { toast } = useToast();

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/blog-posts/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Blog post deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (postsLoading) {
    return <div className="text-center py-8">Loading your blog posts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Blog Posts ({blogPosts.length})
        </CardTitle>
        <p className="text-sm text-gray-600">Manage your published and draft blog posts</p>
      </CardHeader>
      <CardContent>
        {blogPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No blog posts yet. Start creating your first blog post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogPosts.map((post: any) => (
              <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{post.title}</h3>
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {post.isAiGenerated && (
                        <Badge variant="outline">AI Generated</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                      {post.updatedAt !== post.createdAt && (
                        <span> • Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/blogs/${post.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteBlogMutation.mutate(post.id)}
                      disabled={deleteBlogMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateBlogTab({ user }: any) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    isPublished: false,
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("/api/blog-posts", {
        method: "POST",
        data: {
          ...data,
          authorName: user.username,
          isAiGenerated: false,
        }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Blog post created successfully!" });
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        isPublished: false,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBlogMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Blog Post
        </CardTitle>
        <p className="text-sm text-gray-600">Write and publish a new blog post</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter blog post title"
              required
            />
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief summary of the blog post"
              rows={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog post content here..."
              rows={8}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="publish"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="publish">Publish immediately</Label>
          </div>
          <Button 
            type="submit" 
            disabled={createBlogMutation.isPending}
            className="w-full"
          >
            {createBlogMutation.isPending ? "Creating..." : formData.isPublished ? "Publish Blog Post" : "Save as Draft"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AllStaffTab({ user }: any) {
  const { data: allStaff = [], isLoading } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading staff members...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          All Staff Members ({allStaff.length})
        </CardTitle>
        <p className="text-sm text-gray-600">View all staff profiles in the Centre of Entrepreneurship</p>
      </CardHeader>
      <CardContent>
        {allStaff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No staff members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allStaff.map((staffMember: any) => (
              <div key={staffMember.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Profile Image */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    {staffMember.imageUrl ? (
                      <img 
                        src={staffMember.imageUrl} 
                        alt={staffMember.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Staff Info */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">{staffMember.name}</h3>
                    <p className="text-sm text-gray-600">{staffMember.role}</p>
                    {staffMember.userId === user.id && (
                      <Badge variant="secondary" className="text-xs">Your Profile</Badge>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-500 line-clamp-3">{staffMember.bio}</p>

                  {/* Contact Info */}
                  <div className="flex gap-2 justify-center">
                    {staffMember.email && (
                      <a 
                        href={`mailto:${staffMember.email}`}
                        className="text-blue-600 hover:text-blue-800"
                        title={`Email ${staffMember.name}`}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    {staffMember.linkedinUrl && (
                      <a 
                        href={staffMember.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title={`LinkedIn Profile`}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}