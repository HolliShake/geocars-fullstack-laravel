import PageLayout from '@/components/layout/page.layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetUser, useUploadProfilePicture } from '@rest/api';
import { Camera, FileText, Mail, MapPin, Phone, Shield, User } from 'lucide-react';
import type React from 'react';
import InfoTab from './components/info.tab';
import RequirementTab from './components/requirement.tab';

export default function ProfilePage(): React.ReactElement {
  const { data: user } = useGetUser();
  const { mutateAsync: uploadProfilePicture } = useUploadProfilePicture();

  const handleUploadProfilePicture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        alert('The file field is required.');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2048 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      uploadProfilePicture({
        id: user?.data?.id ?? 0,
        data: { file: file as unknown as Blob },
      });
    };
    input.click();
  };

  return (
    <PageLayout title="Profile" description="Manage your profile information and files.">
      <div className="space-y-8">
        {/* Enhanced Profile Header with Web3 Design */}
        <Card className="border-border shadow-lg bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg ring-2 ring-ring">
                  <AvatarImage src={user?.data?.profile_picture ?? ''} alt="Profile picture" />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white text-2xl">
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl shadow-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 border-0"
                >
                  <Camera className="h-4 w-4 text-white" />
                </Button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {user?.data?.firstname && user?.data?.lastname
                      ? `${user.data.firstname} ${user.data.lastname}`
                      : 'John Doe'}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-400 border-green-500/20 backdrop-blur-sm"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.data?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    <span>{user?.data?.email ?? 'john.doe@example.com'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-blue-400" />
                    <span>{user?.data?.phone ?? '+1 (555) 123-4567'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>
                    {user?.data?.city && user?.data?.country
                      ? `${user.data.city}, ${user.data.country}`
                      : (user?.data?.city ?? user?.data?.country ?? 'San Francisco, CA')}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    className="border-border hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 rounded-lg"
                    onClick={handleUploadProfilePicture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Profile Tabs with Web3 Design */}
        <Tabs defaultValue="information">
          <TabsList className="grid grid-cols-2 h-12 p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
            <TabsTrigger
              value="information"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:via-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:shadow-sm data-[state=active]:border-border rounded-lg"
            >
              <User className="h-4 w-4 mr-2" />
              Information
            </TabsTrigger>
            <TabsTrigger
              value="requirement"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:via-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:shadow-sm data-[state=active]:border-border rounded-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Requirement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="space-y-6 mt-6">
            <InfoTab />
          </TabsContent>

          <TabsContent value="requirement" className="space-y-6 mt-6">
            <RequirementTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
