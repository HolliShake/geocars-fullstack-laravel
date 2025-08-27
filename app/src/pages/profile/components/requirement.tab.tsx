import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Download, Eye, FileText, Shield, Star, Trash2, Upload } from 'lucide-react';
import type React from 'react';

export default function RequirementTab(): React.ReactElement {
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
          <Button className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 shadow-lg border-0 rounded-lg">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </CardHeader>
      <Separator className="bg-border" />
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto text-cyan-400 mb-2" />
                <p className="text-sm font-medium text-foreground">Total Files</p>
                <p className="text-2xl font-bold text-cyan-400">12</p>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto text-green-400 mb-2" />
                <p className="text-sm font-medium text-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-400">8</p>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <CalendarDays className="h-8 w-8 mx-auto text-amber-400 mb-2" />
                <p className="text-sm font-medium text-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-400">4</p>
              </div>
            </Card>
          </div>

          <div className="border border-border rounded-xl divide-y divide-border bg-card/20 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-blue-500/5 hover:to-purple-500/5 transition-all rounded-t-xl">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-foreground">Driver's License</p>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400 border-green-500/20 backdrop-blur-sm"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                    <span>2.4 MB • PDF</span>
                    <span className="flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      Uploaded 2 days ago
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
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
              </div>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-blue-500/5 hover:to-purple-500/5 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-foreground">Proof of Income</p>
                    <Badge
                      variant="outline"
                      className="border-amber-500/20 text-amber-400 bg-amber-500/10 backdrop-blur-sm"
                    >
                      Pending Review
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                    <span>1.8 MB • PDF</span>
                    <span className="flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      Uploaded 1 week ago
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
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
              </div>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-blue-500/5 hover:to-purple-500/5 transition-all rounded-b-xl">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-foreground">Vehicle Registration</p>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400 border-green-500/20 backdrop-blur-sm"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                    <span>3.2 MB • PDF</span>
                    <span className="flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      Uploaded 3 days ago
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg"
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
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
