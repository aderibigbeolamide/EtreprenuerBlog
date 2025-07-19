import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Mail, Users } from "lucide-react";
import type { Staff } from "@shared/schema";

interface StaffCardProps {
  member: Staff;
  showFullBio?: boolean;
}

export default function StaffCard({ member, showFullBio = false }: StaffCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-300 h-full">
      <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col">
        {/* Profile Image */}
        {member.imageUrl ? (
          <img 
            src={member.imageUrl} 
            alt={member.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 object-cover"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
          </div>
        )}
        
        {/* Name and Role */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
        <p className="text-primary font-medium mb-3 text-sm sm:text-base">{member.role}</p>
        
        {/* Bio */}
        <div className="flex-1">
          <p className={`text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 ${showFullBio ? '' : 'line-clamp-3'}`}>
            {member.bio}
          </p>
        </div>
        
        {/* Contact Links */}
        <div className="flex justify-center space-x-2 sm:space-x-3">
          {member.linkedinUrl && (
            <a 
              href={member.linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="sm" variant="outline" className="text-primary hover:text-blue-700 transition-colors">
                <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">LinkedIn Profile</span>
              </Button>
            </a>
          )}
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="inline-block"
            >
              <Button size="sm" variant="outline" className="text-primary hover:text-blue-700 transition-colors">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Email Contact</span>
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
