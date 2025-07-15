import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ImageLightbox from "@/components/ui/image-lightbox";
import { Calendar, User, Bot, ArrowRight } from "lucide-react";
import type { BlogPostWithAuthor } from "@shared/schema";

interface BlogCardProps {
  post: BlogPostWithAuthor;
}

export default function BlogCard({ post }: BlogCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleNextImage = () => {
    if (post.imageUrls && currentImageIndex < post.imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      {/* Featured Image */}
      {post.imageUrls && post.imageUrls.length > 0 ? (
        <img 
          src={post.imageUrls[0]} 
          alt={post.title}
          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleImageClick(0)}
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-sm">No Image</div>
          </div>
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Post Meta */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          {post.isAiGenerated && (
            <>
              <Bot className="mr-2 h-3 w-3 text-accent" />
              <Badge variant="secondary" className="bg-accent bg-opacity-10 text-accent text-xs font-medium mr-3">
                AI Generated
              </Badge>
            </>
          )}
          <Calendar className="mr-1 h-3 w-3" />
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {/* Post Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors line-clamp-2">
          <Link href={`/blog/${post.id}`} className="cursor-pointer">
            {post.title}
          </Link>
        </h3>

        {/* Post Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author and Read More */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {post.author?.imageUrl ? (
              <img 
                src={post.author.imageUrl} 
                alt={post.author.name}
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                {post.author?.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </div>
            )}
            <div>
              <div className="text-sm text-gray-700 font-medium">{post.author?.name}</div>
              <div className="text-xs text-gray-500">{post.author?.role}</div>
            </div>
          </div>
          
          <Link href={`/blog/${post.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700 transition-colors">
              Read More
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>

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
    </Card>
  );
}
