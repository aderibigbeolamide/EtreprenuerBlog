import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { MessageSquare, Send } from "lucide-react";
import type { Comment } from "@shared/schema";

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();
  const [commentData, setCommentData] = useState({
    authorName: "",
    content: ""
  });

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['/api/blog-posts', postId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/blog-posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: { authorName: string; content: string }) => {
      const response = await fetch(`/api/blog-posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment posted successfully!",
        description: "Your comment has been added to the discussion.",
      });
      setCommentData({ authorName: "", content: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts', postId, 'comments'] });
    },
    onError: () => {
      toast({
        title: "Failed to post comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentData.authorName.trim() || !commentData.content.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both name and comment are required.",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate(commentData);
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold text-gray-900">
          Comments {comments && `(${comments.length})`}
        </h3>
      </div>
      
      {/* Comment Form */}
      <Card className="bg-neutral">
        <CardHeader>
          <CardTitle className="text-lg">Add a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="author-name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <Input
                id="author-name"
                type="text"
                placeholder="Enter your name"
                value={commentData.authorName}
                onChange={(e) => setCommentData(prev => ({ ...prev, authorName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-2">
                Comment *
              </label>
              <Textarea
                id="comment-content"
                placeholder="Share your thoughts..."
                rows={4}
                value={commentData.content}
                onChange={(e) => setCommentData(prev => ({ ...prev, content: e.target.value }))}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-blue-700"
              disabled={createCommentMutation.isPending}
            >
              {createCommentMutation.isPending ? (
                "Posting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="border-l-4 border-primary">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{comment.authorName}</div>
                    <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {comment.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-600">Be the first to share your thoughts on this article!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
