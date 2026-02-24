import { Outlet } from '@tanstack/react-router';
import Navigation from './Navigation';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Activity } from 'lucide-react';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/pattern-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Smart Campus</span>
          </div>
          <LoginButton />
        </div>
      </header>

      {isAuthenticated ? (
        <div className="flex">
          <Navigation />
          <main className="flex-1 relative">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="container py-12 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="relative h-48 mb-8 rounded-lg overflow-hidden">
              <img 
                src="/assets/generated/hero-campus.dim_1200x400.png" 
                alt="Smart Campus" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Smart Campus</h1>
            <p className="text-lg text-muted-foreground">
              Automate and optimize university campus operations with IoT, AI, and cloud technologies.
              Please log in to access the system.
            </p>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t mt-auto relative">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Smart Campus Automation System. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'smart-campus'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
