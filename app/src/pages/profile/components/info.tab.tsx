import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Edit3 } from 'lucide-react';
import type React from 'react';

export default function InfoTab(): React.ReactElement {
  return (
    <Card className="shadow-lg bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Personal Information
            </CardTitle>
            <CardDescription className="mt-1">
              Update your personal details and contact information.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10 rounded-lg"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <Separator className="bg-border" />
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstname" className="text-sm font-medium text-foreground">
              First Name
            </Label>
            <Input
              id="firstname"
              defaultValue="John"
              className="h-11 focus:ring-2 focus:ring-ring transition-all bg-background border-border rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname" className="text-sm font-medium text-foreground">
              Last Name
            </Label>
            <Input
              id="lastname"
              defaultValue="Doe"
              className="h-11 focus:ring-2 focus:ring-ring transition-all bg-background border-border rounded-lg"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            defaultValue="john.doe@example.com"
            className="h-11 focus:ring-2 focus:ring-ring transition-all bg-background border-border rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone Number
          </Label>
          <Input
            id="phone"
            defaultValue="+1 (555) 123-4567"
            className="h-11 focus:ring-2 focus:ring-ring transition-all bg-background border-border rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-foreground">
            Address
          </Label>
          <Input
            id="address"
            defaultValue="123 Main St, San Francisco, CA 94102"
            className="h-11 focus:ring-2 focus:ring-ring transition-all bg-background border-border rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthdate" className="text-sm font-medium text-foreground">
            Date of Birth
          </Label>
          <Input
            id="birthdate"
            type="date"
            defaultValue="1990-01-15"
            className="h-11 focus:ring-2 focus:ring-ring transition-all bg-background border-border rounded-lg"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" className="border-border hover:bg-muted rounded-lg">
            Cancel
          </Button>
          <Button className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 shadow-lg border-0 rounded-lg">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
