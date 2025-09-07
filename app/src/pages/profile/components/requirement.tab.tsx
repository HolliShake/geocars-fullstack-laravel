/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateUserRequirement, useGetUser, useGetUserRequirements } from '@rest/api';
import {
  AlertCircle,
  CalendarDays,
  Download,
  Eye,
  FileText,
  Shield,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { toast } from 'sonner';

export default function RequirementTab(): React.ReactElement {
  const { data: user } = useGetUser();
  const { data: userRequirements, isLoading, refetch } = useGetUserRequirements();
  const { mutateAsync: createUserRequirement, isPending } = useCreateUserRequirement();

  // Calculate statistics from actual data
  const stats = useMemo(() => {
    if (!userRequirements?.data || !Array.isArray(userRequirements.data)) {
      return { total: 0, uploaded: 0, notUploaded: 0 };
    }

    const requirements = userRequirements.data;
    const uploaded = requirements.filter((req) => req.media && req.media.length > 0).length;
    const notUploaded = requirements.filter((req) => !req.media || req.media.length === 0).length;

    return {
      total: requirements.length,
      uploaded,
      notUploaded,
    };
  }, [userRequirements]);

  const handleFileUpload = (requirementId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg,.webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        alert('Please select a file to upload.');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Here you would typically call an API to upload the file
      // For now, we'll just show a success
      try {
        await createUserRequirement({
          data: {
            user_id: user?.data?.id as number,
            requirement_id: requirementId,
            file: file,
          },
        });
        toast.success('File uploaded successfully');
        refetch();
      } catch (err: any) {
        toast.error((err?.response?.data?.message as string) ?? 'Failed to upload file');
      }
    };
    input.click();
  };

  const handleDownload = (mediaItem: any) => {
    if (mediaItem.url) {
      window.open(mediaItem.url, '_blank');
    }
  };

  const handleView = (mediaItem: any) => {
    if (mediaItem.url) {
      window.open(mediaItem.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, index) => (
                <Card
                  key={index}
                  className="p-4 bg-gradient-to-br from-gray-500/10 to-gray-500/10 border-gray-500/20 backdrop-blur-sm rounded-xl"
                >
                  <div className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-lg" />
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-8 w-12 mx-auto" />
                  </div>
                </Card>
              ))}
            </div>

            <div className="border border-border rounded-xl divide-y divide-border bg-card/20 backdrop-blur-sm">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 ${
                    index === 0 ? 'rounded-t-xl' : ''
                  } ${index === 4 ? 'rounded-b-xl' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-3 w-48 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Document Manager
            </CardTitle>
            <CardDescription className="mt-1">
              Manage your uploaded documents and files securely.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-border" />
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto text-cyan-400 mb-2" />
                <p className="text-sm font-medium text-foreground">Total Requirements</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.total}</p>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto text-green-400 mb-2" />
                <p className="text-sm font-medium text-foreground">Uploaded</p>
                <p className="text-2xl font-bold text-green-400">{stats.uploaded}</p>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-amber-400 mb-2" />
                <p className="text-sm font-medium text-foreground">Not Uploaded</p>
                <p className="text-2xl font-bold text-amber-400">{stats.notUploaded}</p>
              </div>
            </Card>
          </div>

          <div className="border border-border rounded-xl divide-y divide-border bg-card/20 backdrop-blur-sm">
            {userRequirements?.data &&
            Array.isArray(userRequirements.data) &&
            userRequirements.data.length > 0 ? (
              userRequirements.data.map((requirement, index) => {
                const hasMedia = requirement.media && requirement.media.length > 0;
                const isFirst = index === 0;
                const isLast = index === (userRequirements.data?.length || 0) - 1;

                return (
                  <div
                    key={requirement.requirement_id || index}
                    className={`flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-blue-500/5 hover:to-purple-500/5 transition-all ${
                      isFirst ? 'rounded-t-xl' : ''
                    } ${isLast ? 'rounded-b-xl' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg backdrop-blur-sm ${
                          hasMedia
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                            : 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20'
                        }`}
                      >
                        {hasMedia ? (
                          <FileText className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-foreground">{requirement.name}</p>
                          {hasMedia ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-500/20 text-green-400 border-green-500/20 backdrop-blur-sm"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Uploaded ({requirement.media?.length})
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 text-amber-400 bg-amber-500/10 backdrop-blur-sm"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Uploaded
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          {hasMedia ? (
                            <>
                              <span>
                                {requirement.media?.length === 1
                                  ? '1 file uploaded'
                                  : `${requirement.media?.length} files uploaded`}
                              </span>
                              <span className="flex items-center">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                {requirement.updated_at
                                  ? new Date(requirement.updated_at).toLocaleDateString()
                                  : 'Recently'}
                              </span>
                            </>
                          ) : (
                            <span className="text-amber-400">No file uploaded yet</span>
                          )}
                        </div>
                        {requirement.description && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-md">
                            {requirement.description}
                          </p>
                        )}
                        {hasMedia && requirement.media && (
                          <div className="mt-2 space-y-1">
                            {requirement.media.map((mediaItem, mediaIndex) => (
                              <div
                                key={mediaItem.id || mediaIndex}
                                className="flex items-center space-x-2 text-xs text-muted-foreground"
                              >
                                <FileText className="h-3 w-3" />
                                <span className="truncate max-w-xs">{mediaItem.file_name}</span>
                                <span className="text-xs bg-muted px-1 py-0.5 rounded">
                                  {mediaItem.mime_type}
                                </span>
                                {mediaItem.size && (
                                  <span className="text-xs">
                                    {(mediaItem.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasMedia && requirement.media ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
                            onClick={() => handleView(requirement.media?.[0])}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
                            onClick={() => handleDownload(requirement.media?.[0])}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
                          disabled={isPending}
                          onClick={() => handleFileUpload(requirement.requirement_id as number)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No requirements found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Requirements will appear here once they are configured
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
