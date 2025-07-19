import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Youtube, Rss } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Centre of Entrepreneurship</h3>
            <h4 className="text-orange-400 font-semibold mb-2 text-sm sm:text-base">University of Abuja</h4>
            <p className="text-gray-300 mb-4 leading-relaxed text-sm sm:text-base">
              Leading entrepreneurship education and innovation in Nigeria. We empower the next generation 
              of business leaders through cutting-edge research, practical training, and innovative thinking.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <Button size="sm" variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2">
                <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
              <Button size="sm" variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2">
                <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button size="sm" variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2">
                <Youtube className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">YouTube</span>
              </Button>
              <Button size="sm" variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2">
                <Rss className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">RSS Feed</span>
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-white transition-colors">
                  Staff
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Research Papers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Startup Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  AI Tools
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Centre of Entrepreneurship. changing the world through innovations | 
             <a href="#" className="hover:text-white transition-colors ml-1">Privacy Policy</a> | 
             <a href="#" className="hover:text-white transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
