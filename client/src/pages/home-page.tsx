import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BlogCard from "@/components/blog/blog-card";
import StaffCard from "@/components/staff/staff-card";
import { BookOpen, Users, TrendingUp, Award, ArrowRight, Bot, GraduationCap } from "lucide-react";
import type { BlogPostWithAuthor, Staff } from "@shared/schema";
import universityImage from "@assets/Uni-Abuja_1752836990130.png";

export default function HomePage() {
  const { data: featuredPosts, isLoading: postsLoading } = useQuery<BlogPostWithAuthor[]>({
    queryKey: ['/api/blog-posts'],
    queryFn: async () => {
      const response = await fetch('/api/blog-posts?published=true');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const posts = await response.json();
      return posts.slice(0, 3); // Get first 3 posts for featured section
    }
  });

  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-24 lg:py-32">
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div 
          style={{
            backgroundImage: `url(${universityImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
          className="absolute inset-0"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-left bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Centre of Entrepreneurship
                <span className="text-orange-300 block mt-2 drop-shadow-lg"> University of Abuja</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed drop-shadow-md">
                Fostering innovation, nurturing entrepreneurs, and building the future of business in Nigeria through cutting-edge research and modern insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/blog">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl border-2 border-orange-400">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Explore Our Insights
                  </Button>
                </Link>
                <Link href="/staff">
                  <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur border-2 border-white/40 text-white hover:bg-white/30 shadow-xl">
                    <Users className="mr-2 h-5 w-5" />
                    Meet Our Experts
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* University Info Card */}
            <div className="lg:block hidden">
              <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Leading Innovation in Nigeria
                  </h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">500+</div>
                      <div className="text-sm text-gray-600">Students Supported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-500">50+</div>
                      <div className="text-sm text-gray-600">Startups Launched</div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    At the heart of Abuja, we're driving entrepreneurial excellence through innovative programs, research, and AI-powered content creation.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Entrepreneurship Insights
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover expert knowledge and innovative ideas from the University of Abuja's Centre of Entrepreneurship, 
              designed to inspire and guide aspiring entrepreneurs in Nigeria.
            </p>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
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
          ) : featuredPosts && featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">No blog posts available yet.</div>
              <p className="text-sm text-gray-400">Check back soon for entrepreneurship insights!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/blog">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                View All Blog Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Content Generation Showcase */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart Content Creation System
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our advanced content management platform helps create engaging entrepreneurship content 
              with intelligent tools and templates, making knowledge sharing simple and effective.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center mb-6">
                  <Bot className="text-accent mr-3 h-6 w-6" />
                  <h3 className="text-xl font-bold text-gray-900">AI Content Generator</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blog Headline</label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                      The Future of Sustainable Technology in Business
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <div className="text-gray-400 mb-2">📤</div>
                      <p className="text-gray-600">Upload image for AI analysis</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-accent hover:bg-orange-600 text-white">
                    <Bot className="mr-2 h-4 w-4" />
                    Generate AI Content
                  </Button>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">24</div>
                      <div className="text-sm text-gray-600">Total Articles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">18</div>
                      <div className="text-sm text-gray-600">Smart Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">1,247</div>
                      <div className="text-sm text-gray-600">Total Readers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">89</div>
                      <div className="text-sm text-gray-600">Discussions</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">AI content generation from headlines</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Image analysis and context integration</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Automated content optimization</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Preview */}
      <section className="py-16 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Faculty
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our distinguished faculty combines academic excellence with real-world business experience, 
              providing students with comprehensive entrepreneurship education and mentorship.
            </p>
          </div>

          {staffLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-16 bg-gray-200 rounded animate-pulse" />
                </Card>
              ))}
            </div>
          ) : staff && staff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staff.slice(0, 3).map((member) => (
                <StaffCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">No faculty members listed yet.</div>
              <p className="text-sm text-gray-400">Our faculty information will be available soon!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/staff">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                View All Faculty Members
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              University of Abuja Excellence
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Leading entrepreneurship education in the Federal Capital Territory and across Nigeria
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-orange-400">1,000+</div>
              <div className="text-blue-200">Students Trained</div>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-orange-400">15+</div>
              <div className="text-blue-200">Years of Excellence</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-orange-400">200+</div>
              <div className="text-blue-200">Graduate Businesses</div>
            </div>
            <div className="text-center">
              <Bot className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-orange-400">Smart</div>
              <div className="text-blue-200">Learning Platform</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
