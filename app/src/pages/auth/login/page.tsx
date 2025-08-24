import { useAuth } from '@/components/auth.provider';
import ThemeSwitcher from '@/components/custom/theme-switcher.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renderError } from '@/lib/error';
import type { Role } from '@/types/role';
import { useLoginWithCredentials } from '@rest/api';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage(): React.ReactNode {
  const [email, setEmail] = useState('redondophilippandrewroa.dev@gmail.com');
  const [password, setPassword] = useState('admin@user69420');
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const { mutateAsync: loginAsync, isPending: isLoading } = useLoginWithCredentials();

  const [errorResponse, setErrorResponse] = useState<{
    email?: {
      type: string;
      message: string;
    };
    password?: {
      type: string;
      message: string;
    };
  }>({
    email: {
      type: 'value',
      message: '',
    },
    password: {
      type: 'value',
      message: '',
    },
  });

  const setError = (key: 'email' | 'password', message: { type: string; message: string }) => {
    setErrorResponse({ ...errorResponse, [key]: message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorResponse({
      email: {
        type: 'value',
        message: '',
      },
      password: {
        type: 'value',
        message: '',
      },
    });
    try {
      const response = await loginAsync({
        data: {
          email,
          password,
        },
      });
      auth.setCredentials(response.data?.token as string, response.data?.role as Role);
      toast.success('Login successful');
    } catch (error) {
      renderError(error, setError);
    }
  };

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

      <Card className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-md shadow-2xl border-0 backdrop-blur-xl bg-card/95 overflow-hidden">
        {/* Card background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />

        <CardHeader className="relative space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
          {/* Logo/Icon with Web3 styling - responsive sizing */}
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3 sm:mb-4 relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-card rounded-md sm:rounded-lg flex items-center justify-center">
              <LogIn className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse" />
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground font-medium">
            Sign in to your GeoCars account
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                Email Address
              </Label>
              <div className="relative group space-y-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-500/0 to-blue-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-cyan-500/5 group-focus-within:to-blue-500/5 group-focus-within:opacity-100" />
                {errorResponse.email?.message && (
                  <p className="text-red-500 text-xs">{errorResponse.email.message}</p>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-blue-400" />
                Password
              </Label>
              <div className="relative group space-y-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 sm:h-12 pl-3 sm:pl-4 pr-10 sm:pr-12 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1 h-8 w-8 sm:h-10 sm:w-10 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/0 to-purple-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-blue-500/5 group-focus-within:to-purple-500/5 group-focus-within:opacity-100" />
                {errorResponse.password?.message && (
                  <p className="text-red-500 text-xs">{errorResponse.password.message}</p>
                )}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-300 p-0 h-auto font-medium"
              >
                Forgot your password?
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="text-center space-y-2 pt-3 sm:pt-4 border-t border-border/30">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 p-0 h-auto font-semibold underline-offset-4 hover:underline text-xs sm:text-sm"
              >
                Sign up here
              </Button>
            </p>
          </div>
        </CardContent>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </Card>
    </div>
  );
}
