import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useProfile';
import Layout from './components/Layout';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import AutomationRules from './pages/AutomationRules';
import RuleEditor from './pages/RuleEditor';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Recommendations from './pages/Recommendations';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const devicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/devices',
  component: Devices,
});

const deviceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/devices/$id',
  component: DeviceDetail,
});

const automationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/automation',
  component: AutomationRules,
});

const ruleNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/automation/new',
  component: RuleEditor,
});

const ruleEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/automation/$id/edit',
  component: RuleEditor,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: Analytics,
});

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alerts',
  component: Alerts,
});

const recommendationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recommendations',
  component: Recommendations,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  devicesRoute,
  deviceDetailRoute,
  automationRoute,
  ruleNewRoute,
  ruleEditRoute,
  analyticsRoute,
  alertsRoute,
  recommendationsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetup />}
      <Toaster />
    </ThemeProvider>
  );
}
