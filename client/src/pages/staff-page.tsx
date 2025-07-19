import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StaffCard from "@/components/staff/staff-card";
import type { Staff } from "@shared/schema";

export default function StaffPage() {
  const { data: staff, isLoading } = useQuery<Staff[]>({
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
              Our Expert Team
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Meet the dedicated professionals who drive innovation and excellence at the 
              Centre of Entrepreneurship, bringing together diverse expertise in business, 
              technology, and education.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4 sm:p-6 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 bg-gray-200 animate-pulse" />
                  <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-12 sm:h-16 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="flex justify-center space-x-3">
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : staff && staff.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {staff.map((member) => (
                <StaffCard key={member.id} member={member} showFullBio />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="text-gray-500 text-base sm:text-lg mb-2">No staff members listed</div>
              <p className="text-gray-400 text-sm sm:text-base">Our team information will be available soon!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
