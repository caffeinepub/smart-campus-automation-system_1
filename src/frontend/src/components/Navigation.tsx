import { Link, useRouterState } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  Cpu, 
  Zap, 
  BarChart3, 
  AlertTriangle, 
  Lightbulb 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devices', label: 'Devices', icon: Cpu },
  { path: '/automation', label: 'Automation', icon: Zap },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/recommendations', label: 'AI Insights', icon: Lightbulb },
];

export default function Navigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <aside className="w-64 border-r bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || 
            (item.path !== '/' && currentPath.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
