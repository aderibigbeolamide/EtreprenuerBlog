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
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Expert Team
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Meet the dedicated professionals who drive innovation and excellence at the 
              Centre of Entrepreneurship, bringing together diverse expertise in business, 
              technology, and education.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-16 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="flex justify-center space-x-3">
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : staff && staff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staff.map((member) => (
                <StaffCard key={member.id} member={member} showFullBio />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg mb-2">No staff members listed</div>
              <p className="text-gray-400">Our team information will be available soon!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
