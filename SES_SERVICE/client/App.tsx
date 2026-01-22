import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import SolutionsPage from './components/SolutionsPage';
import PricingPage from './components/PricingPage';
import AdminLayout from './components/AdminLayout';
import AdminWebhook from './components/AdminWebhook';
import AdminWebhookLogs from './components/AdminWebhookLogs';
import AdminInquiries from './components/AdminInquiries';
import { userService } from './lib/api';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const currentUser = userService.getCurrentUser();
  return currentUser ? element : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020617]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminLayout />} />}
        >
          <Route index element={<Navigate to="/admin/inquiries" replace />} />
          <Route path="webhook" element={<ProtectedRoute element={<AdminWebhook />} />} />
          <Route path="webhook-logs" element={<ProtectedRoute element={<AdminWebhookLogs />} />} />
          <Route path="inquiries" element={<ProtectedRoute element={<AdminInquiries />} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;