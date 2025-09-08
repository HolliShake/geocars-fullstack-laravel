import ThemeSwitcher from '@/components/custom/theme-switcher.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, RefreshCw, Search } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router';

export default function Page403(): React.ReactNode {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Animated background layers */}
      <div className="absolute inset-0 bg-background w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/3 via-transparent to-cyan-500/3" />
      </div>

      {/* Floating geometric shapes - responsive positioning */}
      <div className="absolute top-10 left-4 sm:top-1/4 sm:left-1/4 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 right-4 sm:bottom-1/4 sm:right-1/4 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse [animation-delay:1000ms]" />

      {/* Additional floating elements for depth */}
      <div className="absolute top-1/2 left-8 sm:left-16 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500/8 to-purple-500/8 rounded-xl blur-lg animate-pulse [animation-delay:500ms]" />
      <div className="absolute top-20 right-8 sm:right-20 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-lg animate-pulse [animation-delay:1500ms]" />

      <Card className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl shadow-2xl border-0 backdrop-blur-xl bg-card/95 overflow-hidden">
        {/* Card background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />

        <CardHeader className="relative space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
          {/* 404 Icon with Web3 styling - responsive sizing */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3 sm:mb-4 relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-card rounded-lg sm:rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
            </div>
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse" />
          </div>

          {/* Large 404 number */}
          <div className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            403
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Forbidden Access
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground font-medium px-2">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate(-1)}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white border-0 font-medium text-sm sm:text-base shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02]"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Go Back
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="h-11 sm:h-12 border-border/50 hover:border-cyan-400/50 bg-card/50 hover:bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 text-sm sm:text-base"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Home
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="h-11 sm:h-12 border-border/50 hover:border-purple-400/50 bg-card/50 hover:bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Retry
              </Button>
            </div>
          </div>

          {/* Helpful message */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              If you believe this is an error, please contact support or try refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
