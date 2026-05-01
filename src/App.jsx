import { Toaster } from "@/components/ui/toaster"
import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import { navLogoRef } from "@/lib/navLogoRef";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Landing from '@/pages/Landing';
import AppLayout from '@/components/layout/AppLayout';
import Requests from '@/pages/Requests';
import NewRequest from '@/pages/NewRequest';
import RequestDetail from '@/pages/RequestDetail';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import Onboarding from '@/pages/Onboarding.jsx';
import Jobs from '@/pages/vetter/Jobs';
import Schedule from '@/pages/vetter/Schedule';
import Earnings from '@/pages/vetter/Earnings';
import VetterOnboarding from '@/pages/vetter/VetterOnboarding';
import ApplicationReceived from '@/pages/vetter/ApplicationReceived';
import VetterProfilePage from '@/pages/vetter/VetterProfile';
import SubmitReport from '@/pages/vetter/SubmitReport';
import ReportView from '@/pages/ReportView';
import FAQ from '@/pages/FAQ';
import VetterMap from '@/pages/VetterMap';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminVetters from '@/pages/admin/AdminVetters';
import AdminRequests from '@/pages/admin/AdminRequests';
import AdminDisputes from '@/pages/admin/AdminDisputes';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminFlagged from '@/pages/admin/AdminFlagged';
import AdminMetrics from '@/pages/admin/AdminMetrics';
import SiteMap from '@/pages/admin/SiteMap';
import AdminUsers from '@/pages/admin/AdminUsers';
import Referrals from '@/pages/Referrals';
import EditProfile from '@/pages/EditProfile';
import BuyerDashboard from '@/pages/BuyerDashboard';
import VetterDashboard from '@/pages/vetter/VetterDashboard';
import SmartRedirect from '@/components/SmartRedirect.jsx';
import SellerDashboard from '@/pages/SellerDashboard';
import Chat from '@/pages/Chat';
import PublicVetterProfile from '@/pages/PublicVetterProfile';
import RoleRoute from '@/components/RoleRoute';
import VetterStatusRoute from '@/components/VetterStatusRoute';
import Listings from '@/pages/Listings';
import NewListing from '@/pages/NewListing';
import ListingDetail from '@/pages/ListingDetail';
import ListingReport from '@/pages/ListingReport';
import VetterJobs from '@/pages/vetter/VetterJobs';
import VetterJobReport from '@/pages/vetter/VetterJobReport';
import AdminListings from '@/pages/admin/AdminListings';
import VettingRequestPage from '@/pages/VettingRequestPage';
import GetItVetted from '@/pages/GetItVetted';

// "/" always shows the landing page — for everyone
function RootRoute() {
  return <Landing />;
}

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
      <Route path="/" element={<RootRoute />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/vetter/onboarding" element={<VetterOnboarding />} />
      <Route path="/vetter/application-received" element={<ApplicationReceived />} />
      <Route element={<AppLayout />}>
        <Route element={<RoleRoute allowedRoles={["buyer"]} />}>
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["seller"]} />}>
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["vetter"]} />}>
        <Route element={<VetterStatusRoute allowPendingReview />}>
          <Route path="/vetter/profile" element={<VetterProfilePage />} />
        </Route>
        <Route element={<VetterStatusRoute />}>
          <Route path="/vetter/dashboard" element={<VetterDashboard />} />
          <Route path="/dashboard/vetter" element={<VetterDashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/jobs/:id/report" element={<SubmitReport />} />
          <Route path="/vetter/jobs" element={<VetterJobs />} />
          <Route path="/vetter/jobs/:id/report" element={<VetterJobReport />} />
        </Route>
        </Route>
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/new" element={<NewRequest />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/requests/:id/report" element={<ReportView />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/map" element={<VetterMap />} />
        <Route path="/vetters/:id" element={<PublicVetterProfile />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/new" element={<NewListing />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/listings/:id/report" element={<ListingReport />} />
        <Route path="/listings/:id/vet" element={<VettingRequestPage />} />
        <Route path="/get-it-vetted" element={<GetItVetted />} />
      </Route>
      <Route element={<RoleRoute requireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/vetters" element={<AdminVetters />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/flagged" element={<AdminFlagged />} />
          <Route path="/admin/metrics" element={<AdminMetrics />} />
          <Route path="/admin/sitemap" element={<SiteMap />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/listings" element={<AdminListings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  const [splashDone, setSplashDone] = useState(() => {
    // Only show splash once per session
    if (sessionStorage.getItem('splashShown')) return true;
    return false;
  });

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', '1');
    setSplashDone(true);
  };

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        {!splashDone && <SplashScreen onDone={handleSplashDone} navLogoRef={navLogoRef} />}
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App