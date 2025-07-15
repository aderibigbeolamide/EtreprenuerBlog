import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Edit, Trash2, Eye, Calendar, Bot, Plus, Search, Filter } from "lucide-react";
import type { BlogPost, Staff } from "@shared/schema";

export default function BlogManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    authorName: "",
    isPublished: false,
    isAiGenerated: false
  });

  const { data: blogPosts, isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog-posts'],
  });

  const { data: staff } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/blog-posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to delete blog post');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Blog post deleted successfully!",
        description: "The blog post has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
    },
    onError: () => {
      toast({
        title: "Failed to delete blog post",
        description: "There was an error deleting the blog post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await fetch(`/api/admin/blog-posts/${id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to update blog post');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Blog post updated successfully!",
        description: "The changes have been saved.",
      });
      setIsEditDialogOpen(false);
      setSelectedPost(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
    },
    onError: () => {
      toast({
        title: "Failed to update blog post",
        description: "There was an error updating the blog post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setEditFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      authorName: post.authorName,
      isPublished: post.isPublished,
      isAiGenerated: post.isAiGenerated
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    const formData = new FormData();
    formData.append('title', editFormData.title);
    formData.append('content', editFormData.content);
    formData.append('excerpt', editFormData.excerpt);
    formData.append('authorName', editFormData.authorName);
    formData.append('isPublished', editFormData.isPublished.toString());
    formData.append('isAiGenerated', editFormData.isAiGenerated.toString());

    updateMutation.mutate({ id: selectedPost.id, data: formData });
  };

  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = selectedAuthor === "all" || post.authorName === selectedAuthor;
    return matchesSearch && matchesAuthor;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-500" />
          <Input
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {staff?.map(member => (
                <SelectItem key={member.id} value={member.name}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {postsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4" />
                <div className="h-20 bg-gray-200 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-1">
                    {post.isPublished ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {post.isAiGenerated && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Bot className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(post.createdAt)} • {post.authorName}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the blog post
                          "{post.title}" and all its comments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(post.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!postsLoading && filteredPosts.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-lg mb-2">No blog posts found</p>
              <p className="text-sm">
                {searchTerm || selectedAuthor !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Create your first blog post to get started"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={editFormData.excerpt}
                onChange={(e) => setEditFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editFormData.content}
                onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="author">Author</Label>
              <Select 
                value={editFormData.authorName} 
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, authorName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {staff?.map(member => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={editFormData.isPublished}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-generated"
                  checked={editFormData.isAiGenerated}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isAiGenerated: checked }))}
                />
                <Label htmlFor="ai-generated">AI Generated</Label>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}