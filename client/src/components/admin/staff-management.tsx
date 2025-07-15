import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Edit, Trash2, User, Mail, Linkedin, Upload, X, Image } from "lucide-react";
import type { Staff } from "@shared/schema";

export default function StaffManagement() {
  const { toast } = useToast();
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    bio: "",
    email: "",
    linkedinUrl: "",
    isActive: true
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to update staff member');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff member updated successfully!",
        description: "The changes have been saved.",
      });
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setEditImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
    },
    onError: () => {
      toast({
        title: "Failed to update staff member",
        description: "There was an error updating the staff member. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to delete staff member');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff member deleted successfully!",
        description: "The staff member has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
    },
    onError: () => {
      toast({
        title: "Failed to delete staff member",
        description: "There was an error deleting the staff member. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (member: Staff) => {
    setSelectedStaff(member);
    setEditFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      email: member.email || "",
      linkedinUrl: member.linkedinUrl || "",
      isActive: member.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const formData = new FormData();
    formData.append('name', editFormData.name);
    formData.append('role', editFormData.role);
    formData.append('bio', editFormData.bio);
    formData.append('email', editFormData.email);
    formData.append('linkedinUrl', editFormData.linkedinUrl);
    formData.append('isActive', editFormData.isActive.toString());

    if (editImageFile) {
      formData.append('image', editImageFile);
    }

    updateMutation.mutate({ id: selectedStaff.id, data: formData });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staff Management</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4" />
                <div className="h-20 bg-gray-200 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff?.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {member.imageUrl ? (
                    <img 
                      src={member.imageUrl} 
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {member.bio}
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  {member.email && (
                    <Mail className="h-4 w-4 text-gray-500" />
                  )}
                  {member.linkedinUrl && (
                    <Linkedin className="h-4 w-4 text-blue-600" />
                  )}
                  {member.isActive ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete
                          "{member.name}" from the staff directory.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(member.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!staff || staff.length === 0) && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-lg mb-2">No staff members found</p>
              <p className="text-sm">Add your first staff member to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={editFormData.role}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editFormData.bio}
                onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={editFormData.linkedinUrl}
                onChange={(e) => setEditFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image">Profile Image</Label>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditImageFile(file);
                    }
                  }}
                />
                {editImageFile && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                    <Image className="h-4 w-4" />
                    <span className="text-sm">{editImageFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditImageFile(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {selectedStaff?.imageUrl && !editImageFile && (
                  <div className="flex items-center gap-2">
                    <img 
                      src={selectedStaff.imageUrl} 
                      alt="Current profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600">Current image</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={editFormData.isActive}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}