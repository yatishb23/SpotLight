'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function persistAuthData(loginData: any) {
  if (typeof window === 'undefined' || !loginData) return;
  if (loginData.user.accessToken) {
    localStorage.setItem('access_token', loginData.user.accessToken);
  }

  if (loginData.user.refreshToken) {
    localStorage.setItem('refresh_token', loginData.user.refreshToken);
  }

  if(loginData.user.user.userId || loginData.user.user.id) {
    localStorage.setItem('userId', loginData.user.user.userId || loginData.user.user.id);
  }
  if(loginData.user.user.fullName || loginData.user.user.fullName) {
    localStorage.setItem('userName', loginData.user.user.fullName || loginData.user.user.fullName);
  }
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // ✅ NEW STATES
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const router = useRouter();

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
      onOpenChange(false);
    } catch (error) {
      console.error("Login failed", error);
      setMessage("OAuth login failed");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json().catch(() => null);
      if (!loginResponse.ok || !loginData?.success) {
        setMessage(loginData?.message || 'Invalid credentials');
        setIsError(true);
        return;
      }
      
      persistAuthData(loginData);

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setMessage('Invalid credentials');
        setIsError(true);
      } else {
        setMessage('Login successful');
        setIsError(false);
        setTimeout(() => {
          onOpenChange(false);
          router.push('/');
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-8 gap-6">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your email below to sign in to your account
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div
            className={`text-sm p-3 rounded-md ${
              isError
                ? "bg-red-100 text-red-600 border border-red-300"
                : "bg-green-100 text-green-600 border border-green-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="sr-only">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isLoading}
              required
              className="h-11"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="sr-only">Password</Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              disabled={isLoading}
              required
              className="h-11"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth */}
        <div className="grid gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="h-11"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Google"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading}
            className="h-11"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "GitHub"
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-2">
          By clicking continue, you agree to our{' '}
          <div className="inline-flex gap-1">
            <Link href="/terms" className="underline">
              Terms
            </Link>
            and
            <Link href="/privacy" className="underline">
              Privacy
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}