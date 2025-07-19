import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Menu, ShieldQuestion, X } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/staff", label: "Staff" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/">
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                <img 
                  src="/assets/uniabuja-logo.jpeg" 
                  alt="University of Abuja Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
                <h1 className="text-base sm:text-xl font-bold text-primary hidden xs:block">
                  Centre of Entrepreneurship
                </h1>
                <h1 className="text-sm font-bold text-primary block xs:hidden">
                  COE
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Admin Button */}
          <div className="hidden md:block">
            {user ? (
              <Link href="/admin">
                <Button className="bg-primary hover:bg-blue-700 text-white">
                  <ShieldQuestion className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary hover:bg-blue-700 text-white">
                  <ShieldQuestion className="mr-2 h-4 w-4" />
                  Admin Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 text-base font-medium transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "text-primary bg-blue-50 rounded-lg"
                            : "text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  
                  <div className="pt-4 border-t">
                    {user ? (
                      <Link href="/admin">
                        <Button 
                          className="w-full bg-primary hover:bg-blue-700 text-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <ShieldQuestion className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth">
                        <Button 
                          className="w-full bg-primary hover:bg-blue-700 text-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <ShieldQuestion className="mr-2 h-4 w-4" />
                          Admin Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
