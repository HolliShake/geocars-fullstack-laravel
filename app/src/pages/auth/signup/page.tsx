import { useAuth } from '@/components/auth.provider';
import ThemeSwitcher from '@/components/custom/theme-switcher.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renderError } from '@/lib/error';
import { RouteKey } from '@/navigation/route';
import type { Role } from '@/types/role';
import { useSignupWithCredentials } from '@rest/api';
import { Eye, EyeOff, Home, Lock, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function SignupPage(): React.ReactNode {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const auth = useAuth();
  const { mutateAsync: registerAsync, isPending: isLoading } = useSignupWithCredentials();

  const [errorResponse, setErrorResponse] = useState<{
    firstname?: { type: string; message: string };
    lastname?: { type: string; message: string };
    username?: { type: string; message: string };
    phone?: { type: string; message: string };
    country?: { type: string; message: string };
    city?: { type: string; message: string };
    address?: { type: string; message: string };
    postal_code?: { type: string; message: string };
    email?: { type: string; message: string };
    password?: { type: string; message: string };
    password_confirmation?: { type: string; message: string };
  }>({
    firstname: { type: 'value', message: '' },
    lastname: { type: 'value', message: '' },
    username: { type: 'value', message: '' },
    phone: { type: 'value', message: '' },
    country: { type: 'value', message: '' },
    city: { type: 'value', message: '' },
    address: { type: 'value', message: '' },
    postal_code: { type: 'value', message: '' },
    email: { type: 'value', message: '' },
    password: { type: 'value', message: '' },
    password_confirmation: { type: 'value', message: '' },
  });

  const setError = (
    key: keyof typeof errorResponse,
    message: { type: string; message: string }
  ) => {
    setErrorResponse({ ...errorResponse, [key]: message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorResponse({
      firstname: { type: 'value', message: '' },
      lastname: { type: 'value', message: '' },
      username: { type: 'value', message: '' },
      phone: { type: 'value', message: '' },
      country: { type: 'value', message: '' },
      city: { type: 'value', message: '' },
      address: { type: 'value', message: '' },
      postal_code: { type: 'value', message: '' },
      email: { type: 'value', message: '' },
      password: { type: 'value', message: '' },
      password_confirmation: { type: 'value', message: '' },
    });
    try {
      const response = await registerAsync({
        data: {
          firstname,
          lastname,
          username,
          phone,
          country,
          city,
          address,
          postal_code: postalCode,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      auth.setCredentials(response.data?.token as string, response.data?.role as Role);
      toast.success('Account created successfully');
      setTimeout(() => {
        navigate(RouteKey.Auth.Login.key);
      }, 1500);
    } catch (error) {
      renderError(error, setError);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-background">
      {/* Animated background layers (z-0, always at the back) */}
      <div className="absolute inset-0 bg-background w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/3 via-transparent to-cyan-500/3" />
      </div>

      {/* Floating geometric shapes (z-10, above background but below content) */}
      <div className="absolute top-10 left-4 sm:top-1/4 sm:left-1/4 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-xl animate-pulse z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-4 sm:bottom-1/4 sm:right-1/4 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse [animation-delay:1000ms] z-10 pointer-events-none" />

      {/* Theme Switcher (z-50, always on top) */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Card (z-20, above shapes and background, below ThemeSwitcher) */}
      <Card className="relative z-20 w-full max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-3xl shadow-2xl border-0 backdrop-blur-xl bg-card/95 overflow-hidden">
        {/* Card background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />

        <CardHeader className="relative space-y-1 text-center pb-4 sm:pb-6 px-4 sm:px-6">
          {/* Logo/Icon with Web3 styling - responsive sizing */}
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3 sm:mb-4 relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-card rounded-md sm:rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse" />
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground font-medium">
            Join GeoCars and start your journey
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="firstname"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  First Name *
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="firstname"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 to-cyan-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-purple-500/5 group-focus-within:to-cyan-500/5 group-focus-within:opacity-100" />
                  {errorResponse.firstname?.message && (
                    <p className="text-red-500 text-xs">{errorResponse.firstname.message}</p>
                  )}
                </div>
              </div>

              {/* Last Name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="lastname"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  Last Name *
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="lastname"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 to-cyan-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-purple-500/5 group-focus-within:to-cyan-500/5 group-focus-within:opacity-100" />
                  {errorResponse.lastname?.message && (
                    <p className="text-red-500 text-xs">{errorResponse.lastname.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Username and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  Username *
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-500/0 to-blue-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-cyan-500/5 group-focus-within:to-blue-500/5 group-focus-within:opacity-100" />
                  {errorResponse.username?.message && (
                    <p className="text-red-500 text-xs">{errorResponse.username.message}</p>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-cyan-400" />
                  Email Address *
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
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-blue-400" />
                Phone Number
              </Label>
              <div className="relative group space-y-1">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/0 to-purple-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-blue-500/5 group-focus-within:to-purple-500/5 group-focus-within:opacity-100" />
                {errorResponse.phone?.message && (
                  <p className="text-red-500 text-xs">{errorResponse.phone.message}</p>
                )}
              </div>
            </div>

            {/* Location Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-green-400" />
                  Country
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="country"
                    type="text"
                    placeholder="Enter your country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-green-500/0 to-cyan-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-green-500/5 group-focus-within:to-cyan-500/5 group-focus-within:opacity-100" />
                  {errorResponse.country?.message && (
                    <p className="text-red-500 text-xs">{errorResponse.country.message}</p>
                  )}
                </div>
              </div>

              {/* City Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-green-400" />
                  City
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-green-500/0 to-cyan-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-green-500/5 group-focus-within:to-cyan-500/5 group-focus-within:opacity-100" />
                  {errorResponse.city?.message && (
                    <p className="text-red-500 text-xs">{errorResponse.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address and Postal Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Address Input */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <Home className="w-4 h-4 text-orange-400" />
                  Address
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500/0 to-cyan-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-orange-500/5 group-focus-within:to-cyan-500/5 group-focus-within:opacity-100" />
                  {errorResponse.address?.message && (
                    <p className="text-red-500 text-xs">{errorResponse.address.message}</p>
                  )}
                </div>
              </div>

              {/* Postal Code Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="postal_code"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-orange-400" />
                  Postal Code
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="postal_code"
                    type="text"
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500/0 to-cyan-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-orange-500/5 group-focus-within:to-cyan-500/5 group-focus-within:opacity-100" />
                  {errorResponse.postal_code?.message && (
                    <p className="text-red-500 text-xs">{errorResponse.postal_code.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-blue-400" />
                  Password *
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
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

              {/* Password Confirmation Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="password_confirmation"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-purple-400" />
                  Confirm Password *
                </Label>
                <div className="relative group space-y-1">
                  <Input
                    id="password_confirmation"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    className="h-10 sm:h-12 pl-3 sm:pl-4 pr-10 sm:pr-12 text-sm sm:text-base border-border/50 bg-background/50 backdrop-blur-sm focus:border-cyan-500/50 focus:ring-cyan-500/25 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute right-1 top-1 h-8 w-8 sm:h-10 sm:w-10 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-300"
                    aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 to-cyan-500/0 opacity-0 transition-all duration-300 pointer-events-none group-focus-within:from-purple-500/5 group-focus-within:to-cyan-500/5 group-focus-within:opacity-100" />
                  {errorResponse.password_confirmation?.message && (
                    <p className="text-red-500 text-xs">
                      {errorResponse.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isLoading ||
                !firstname ||
                !lastname ||
                !username ||
                !email ||
                !password ||
                !passwordConfirmation
              }
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="text-center space-y-2 pt-3 sm:pt-4 border-t border-border/30">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 p-0 h-auto font-semibold underline-offset-4 hover:underline text-xs sm:text-sm"
                onClick={() => {
                  navigate('/auth/login');
                }}
              >
                Sign in here
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
