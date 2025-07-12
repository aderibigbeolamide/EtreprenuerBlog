import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Bot, Upload, Wand2, Save, Eye, FileText, Image, Video } from "lucide-react";
import type { Staff } from "@shared/schema";

interface GeneratedContent {
  content: string;
  excerpt: string;
}

export default function BlogForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    authorId: "",
    isPublished: false,
    isAiGenerated: false
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const { data: staff } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/admin/blog-posts', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to create blog post');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Blog post created successfully!",
        description: formData.isPublished ? "Your post is now live." : "Your post has been saved as a draft.",
      });
      // Reset form
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        authorId: "",
        isPublished: false,
        isAiGenerated: false
      });
      setImageFiles([]);
      setVideoFiles([]);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
    },
    onError: () => {
      toast({
        title: "Failed to create blog post",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.authorId) {
      toast({
        title: "Please fill in required fields",
        description: "Title, content, and author are required.",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    submitData.append('excerpt', formData.excerpt);
    submitData.append('authorId', formData.authorId);
    submitData.append('isPublished', formData.isPublished.toString());
    submitData.append('isAiGenerated', formData.isAiGenerated.toString());

    imageFiles.forEach(file => {
      submitData.append('images', file);
    });
    
    videoFiles.forEach(file => {
      submitData.append('videos', file);
    });

    createPostMutation.mutate(submitData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Blog Post Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Blog Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter an engaging blog title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              {/* Media Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">Featured Image</Label>
                  <div className="mt-2">
                    <label 
                      htmlFor="image"
                      className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors block"
                    >
                      <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : "Click to upload images"}
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="video">Video (Optional)</Label>
                  <div className="mt-2">
                    <label 
                      htmlFor="video"
                      className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors block"
                    >
                      <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {videoFiles.length > 0 ? `${videoFiles.length} video(s) selected` : "Click to upload videos"}
                      </p>
                      <p className="text-sm text-gray-500">MP4, MOV up to 50MB</p>
                    </label>
                    <input
                      id="video"
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your blog content here..."
                  rows={12}
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief summary for blog listing"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                />
              </div>

              {/* Author */}
              <div>
                <Label htmlFor="author">Author *</Label>
                <Select value={formData.authorId} onValueChange={(value) => handleInputChange('authorId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff?.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Publishing Options */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-blue-700"
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {formData.isPublished ? "Publish Post" : "Save Draft"}
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    // Preview functionality could be added here
                    toast({
                      title: "Preview feature",
                      description: "Preview functionality will be available soon.",
                    });
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Publishing Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={formData.isPublished ? "default" : "secondary"}>
                  {formData.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              
              {formData.isAiGenerated && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content:</span>
                  <Badge variant="secondary" className="bg-accent bg-opacity-10 text-accent">
                    <Bot className="mr-1 h-3 w-3" />
                    AI Generated
                  </Badge>
                </div>
              )}

              {(imageFile || videoFile) && (
                <div>
                  <span className="text-sm font-medium">Media:</span>
                  <div className="mt-2 space-y-1">
                    {imageFile && (
                      <div className="text-xs text-gray-600 flex items-center">
                        <Image className="mr-1 h-3 w-3" />
                        {imageFile.name}
                      </div>
                    )}
                    {videoFile && (
                      <div className="text-xs text-gray-600 flex items-center">
                        <Video className="mr-1 h-3 w-3" />
                        {videoFile.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Features Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Bot className="mr-2 h-5 w-5 text-accent" />
              AI Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Generate comprehensive content from headlines</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Analyze uploaded images for context</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Auto-generate post excerpts</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Professional tone optimized for education</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
