import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Upload, Sparkles } from 'lucide-react';

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
}

export default function CreateBlogPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    isPublished: true
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  
  const createBlogMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('/api/blog-posts', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      setLocation('/blog');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive"
      });
    }
  });
  
  const generateContentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('/api/generate-content', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data: any) => {
      setGeneratedContent(data.content);
      setFormData(prev => ({
        ...prev,
        content: data.content,
        excerpt: data.excerpt || prev.excerpt
      }));
      toast({
        title: "AI Content Generated",
        description: "Content has been generated successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "AI Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
    }
  });

  // Redirect if not approved
  if (!user?.isApproved) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your account needs approval before you can create blog posts.</p>
            <Button onClick={() => setLocation('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: keyof BlogFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedVideos(Array.from(e.target.files));
    }
  };

  const handleGenerateContent = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title first",
        variant: "destructive"
      });
      return;
    }

    const formDataForAI = new FormData();
    formDataForAI.append('headline', formData.title);
    
    if (selectedImages.length > 0) {
      formDataForAI.append('image', selectedImages[0]);
    }

    generateContentMutation.mutate(formDataForAI);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content",
        variant: "destructive"
      });
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    submitData.append('excerpt', formData.excerpt);
    submitData.append('isPublished', formData.isPublished.toString());
    submitData.append('isAiGenerated', generatedContent ? 'true' : 'false');

    selectedImages.forEach((image) => {
      submitData.append('images', image);
    });

    selectedVideos.forEach((video) => {
      submitData.append('videos', video);
    });

    createBlogMutation.mutate(submitData);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/blog')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <p className="text-muted-foreground">Share your thoughts with the community</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter an engaging title..."
                required
              />
            </div>

            {/* AI Content Generation */}
            <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <Label>AI Content Generation</Label>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate content automatically based on your title and optional image.
              </p>
              <Button
                type="button"
                onClick={handleGenerateContent}
                disabled={!formData.title.trim() || generateContentMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {generateContentMutation.isPending ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Content
                  </>
                )}
              </Button>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your blog content here..."
                className="min-h-[300px]"
                required
              />
              {generatedContent && (
                <p className="text-sm text-blue-600 mt-1">
                  ✨ Content generated by AI
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief summary of your post..."
                className="h-20"
              />
            </div>

            {/* Images */}
            <div>
              <Label htmlFor="images">Images</Label>
              <div className="mt-2">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Select multiple images (optional)
                </p>
              </div>
            </div>

            {/* Videos */}
            <div>
              <Label htmlFor="videos">Videos</Label>
              <div className="mt-2">
                <Input
                  id="videos"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Select multiple videos (optional)
                </p>
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
              />
              <Label htmlFor="isPublished">
                {formData.isPublished ? 'Publish immediately' : 'Save as draft'}
              </Label>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createBlogMutation.isPending}
                className="flex-1"
              >
                {createBlogMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.isPublished ? 'Publish Post' : 'Save Draft'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/blog')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}