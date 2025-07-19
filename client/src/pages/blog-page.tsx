import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BlogCard from "@/components/blog/blog-card";
import { Search } from "lucide-react";
import type { BlogPostWithAuthor, Staff } from "@shared/schema";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");

  const { data: posts, isLoading: postsLoading } = useQuery<BlogPostWithAuthor[]>({
    queryKey: ['/api/blog-posts', { search: searchTerm, authorId: selectedAuthor }],
    queryFn: async () => {
      const params = new URLSearchParams({
        published: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedAuthor !== "all" && { authorId: selectedAuthor })
      });
      
      const response = await fetch(`/api/blog-posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const { data: staff } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Entrepreneurship Insights
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Discover AI-generated content covering the latest trends, strategies, and innovations 
              in the world of entrepreneurship and business development.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-6 sm:py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {staff?.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="h-16 bg-gray-200 rounded animate-pulse mb-4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg mb-2">No blog posts found</div>
              <p className="text-gray-400">
                {searchTerm || selectedAuthor 
                  ? "Try adjusting your search criteria" 
                  : "Check back soon for new content!"
                }
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
