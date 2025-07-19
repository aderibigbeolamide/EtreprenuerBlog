import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { TrendingUp, Users, Award, BookOpen, Target, Lightbulb, Globe, Download } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                About the Centre of Entrepreneurship
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-4 sm:mb-6 leading-relaxed">
                We are a leading research and education center dedicated to fostering innovation 
                and entrepreneurial excellence through cutting-edge AI technologies and evidence-based practices.
              </p>
              <p className="text-blue-100 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Our mission is to empower the next generation of entrepreneurs with the knowledge, 
                tools, and insights needed to create sustainable, impactful businesses that solve 
                real-world problems through innovation and technology.
              </p>
              
              <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-accent">500+</div>
                  <div className="text-xs sm:text-sm text-blue-200">Startups Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-accent">95%</div>
                  <div className="text-xs sm:text-sm text-blue-200">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-accent">$50M+</div>
                  <div className="text-xs sm:text-sm text-blue-200">Funding Raised</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/contact">
                  <Button className="w-full sm:w-auto bg-accent hover:bg-orange-600 text-white">
                    Learn More
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto bg-white bg-opacity-20 text-white hover:bg-opacity-30">
                  <Download className="mr-2 h-4 w-4" />
                  Download Brochure
                </Button>
              </div>
            </div>
            
            <div className="lg:text-right">
              <img 
                src="/assets/uniabuja-senate-building.jpg" 
                alt="University of Abuja Senate Building" 
                className="w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Driving innovation and entrepreneurial excellence through education, research, and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To empower entrepreneurs with cutting-edge knowledge, innovative tools, and AI-driven insights 
                that enable them to build sustainable, impactful businesses. We bridge the gap between 
                academic research and practical application, providing comprehensive support from idea 
                conception to market success.
              </p>
            </Card>

            <Card className="p-8">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-8 w-8 text-accent mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To be the world's leading center for entrepreneurship education and innovation, where 
                artificial intelligence and human creativity converge to solve global challenges. We 
                envision a future where every entrepreneur has access to the tools and knowledge needed 
                to create meaningful change in their communities and beyond.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide our work and define our commitment to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">
                Pushing boundaries through creative thinking and technological advancement.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaboration</h3>
              <p className="text-gray-600 text-sm">
                Building strong partnerships and fostering inclusive communities.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600 text-sm">
                Maintaining the highest standards in education and research.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact</h3>
              <p className="text-gray-600 text-sm">
                Creating meaningful change that benefits society and the economy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs & Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Programs & Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive support for entrepreneurs at every stage of their journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Startup Incubation</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive 12-month program providing mentorship, resources, and funding 
                opportunities for early-stage startups.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Weekly mentorship sessions</li>
                <li>• Access to industry experts</li>
                <li>• Seed funding opportunities</li>
                <li>• Co-working space access</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Research</h3>
              <p className="text-gray-600 mb-4">
                Cutting-edge research in artificial intelligence applications for business 
                innovation and entrepreneurship.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Machine learning for market analysis</li>
                <li>• Automated content generation</li>
                <li>• Predictive business modeling</li>
                <li>• AI ethics in entrepreneurship</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Educational Programs</h3>
              <p className="text-gray-600 mb-4">
                Degree and certificate programs designed to develop the next generation 
                of entrepreneurial leaders.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Master's in Entrepreneurship</li>
                <li>• Executive education courses</li>
                <li>• Online certification programs</li>
                <li>• Workshops and seminars</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Entrepreneurial Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community of innovators and let us help you transform your ideas into 
            successful businesses that make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-accent hover:bg-orange-600 text-white">
                Get in Touch
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="outline" className="bg-white bg-opacity-20 text-white hover:bg-opacity-30">
                Explore Our Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
