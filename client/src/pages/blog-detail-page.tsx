import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ImageLightbox from "@/components/ui/image-lightbox";
import VideoPlayer from "@/components/ui/video-player";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CommentSection from "@/components/blog/comment-section";
import { ArrowLeft, Calendar, User, Bot, Play } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { BlogPostWithAuthor } from "@shared/schema";

export default function BlogDetailPage() {
  const { id } = useParams();
  const postId = parseInt(id || "0");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: post, isLoading, error } = useQuery<BlogPostWithAuthor>({
    queryKey: ['/api/blog-posts', postId],
    queryFn: async () => {
      const response = await fetch(`/api/blog-posts/${postId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog post not found');
        }
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!postId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded mb-4 sm:mb-6" />
            <div className="h-48 sm:h-64 bg-gray-200 rounded-lg mb-4 sm:mb-6" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-24 sm:h-32 bg-gray-200 rounded mb-4 sm:mb-6" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            {error?.message === 'Blog post not found' ? 'Blog Post Not Found' : 'Error Loading Post'}
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-4">
            {error?.message === 'Blog post not found' 
              ? 'The blog post you are looking for does not exist or has been removed.'
              : 'There was an error loading the blog post. Please try again later.'
            }
          </p>
          <Link href="/blog">
            <Button className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleNextImage = () => {
    if (post && post.imageUrls && currentImageIndex < post.imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Featured Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-6">
              {post.imageUrls.length === 1 ? (
                <img
                  src={post.imageUrls[0]}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(0)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.imageUrls.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${post.title} - Image ${index + 1}`}
                      className="w-full h-48 md:h-64 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              {post.author?.imageUrl ? (
                <img 
                  src={post.author.imageUrl} 
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {post.author?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">{post.author?.name}</div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            
            {post.isAiGenerated && (
              <Badge variant="secondary" className="bg-accent bg-opacity-10 text-accent">
                <Bot className="mr-1 h-3 w-3" />
                AI Generated Content
              </Badge>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </div>

        {/* Video Section */}
        {post.videoUrls && post.videoUrls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Play className="mr-2 h-5 w-5 text-primary" />
              Video Content
            </h3>
            <div className="space-y-6">
              {post.videoUrls.map((videoUrl, index) => {
                // Extract public ID for quality control
                const publicIdMatch = videoUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.(mp4|webm|mov|avi)/);
                const extractedPublicId = publicIdMatch ? publicIdMatch[1] : undefined;
                
                return (
                  <VideoPlayer
                    key={index}
                    videoUrl={videoUrl}
                    publicId={extractedPublicId}
                    title={`${post.title} - Video ${index + 1}`}
                    className="w-full"
                    controls={true}
                    muted={false}
                  />
                );
              })}
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </article>

      {/* Image Lightbox */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <ImageLightbox
          images={post.imageUrls}
          currentIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          alt={post.title}
        />
      )}

      <Footer />
    </div>
  );
}
