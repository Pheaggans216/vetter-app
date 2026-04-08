import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Landing from '@/pages/Landing';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Requests from '@/pages/Requests';
import NewRequest from '@/pages/NewRequest';
import RequestDetail from '@/pages/RequestDetail';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import Onboarding from '@/pages/Onboarding';
import Jobs from '@/pages/vetter/Jobs';
import Schedule from '@/pages/vetter/Schedule';
import Earnings from '@/pages/vetter/Earnings';
import VetterOnboarding from '@/pages/vetter/VetterOnboarding';
import VetterProfilePage from '@/pages/vetter/VetterProfile';
import SubmitReport from '@/pages/vetter/SubmitReport';
import ReportView from '@/pages/ReportView';
import FAQ from '@/pages/FAQ';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/vetter/onboarding" element={<VetterOnboarding />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/new" element={<NewRequest />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/vetter/profile" element={<VetterProfilePage />} />
        <Route path="/jobs/:id/report" element={<SubmitReport />} />
        <Route path="/requests/:id/report" element={<ReportView />} />
        <Route path="/faq" element={<FAQ />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App