import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { UserPlus, Upload, Save } from "lucide-react";

export default function StaffForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    email: "",
    linkedinUrl: "",
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const createStaffMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to create staff member');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff member created successfully!",
        description: "The new team member has been added.",
      });
      // Reset form
      setFormData({
        name: "",
        role: "",
        bio: "",
        email: "",
        linkedinUrl: "",
        isActive: true
      });
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
    },
    onError: () => {
      toast({
        title: "Failed to create staff member",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role.trim() || !formData.bio.trim()) {
      toast({
        title: "Please fill in required fields",
        description: "Name, role, and bio are required.",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('role', formData.role);
    submitData.append('bio', formData.bio);
    submitData.append('email', formData.email);
    submitData.append('linkedinUrl', formData.linkedinUrl);
    submitData.append('isActive', formData.isActive.toString());

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    createStaffMutation.mutate(submitData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="mr-2 h-5 w-5" />
          Add New Staff Member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter full name..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role">Role/Title *</Label>
            <Input
              id="role"
              type="text"
              placeholder="e.g., Director of Innovation"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              required
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Biography *</Label>
            <Textarea
              id="bio"
              placeholder="Write a brief biography..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address..."
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
            />
          </div>

          {/* Profile Image */}
          <div>
            <Label htmlFor="image">Profile Photo</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> profile photo
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
                <input 
                  id="image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
              {imageFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="active">Active member</Label>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createStaffMutation.isPending}
          >
            {createStaffMutation.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Staff Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}