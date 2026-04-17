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

// CRM Imports
import { AuthProvider } from './src/crm/context/AuthContext';
import CRMLayout from './src/crm/layout/CRMLayout';
import CRMLoginPage from './src/crm/auth/LoginPage';
import DashboardPage from './src/crm/pages/DashboardPage';
import EmployeesPage from './src/crm/pages/EmployeesPage';
import LeadsPage from './src/crm/pages/LeadsPage';
import CustomersPage from './src/crm/pages/CustomersPage';
import PipelinePage from './src/crm/pages/PipelinePage';
import InventoryPage from './src/crm/pages/InventoryPage';
import OrdersPage from './src/crm/pages/OrdersPage';
import CampaignsPage from './src/crm/pages/CampaignsPage';
import AnalyticsPage from './src/crm/pages/AnalyticsPage';

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
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes (legacy) */}
          <Route
            path="/admin"
            element={<ProtectedRoute element={<AdminLayout />} />}
          >
            <Route index element={<Navigate to="/admin/inquiries" replace />} />
            <Route path="webhook" element={<ProtectedRoute element={<AdminWebhook />} />} />
            <Route path="webhook-logs" element={<ProtectedRoute element={<AdminWebhookLogs />} />} />
            <Route path="inquiries" element={<ProtectedRoute element={<AdminInquiries />} />} />
          </Route>

          {/* ==================== CRM Routes ==================== */}
          <Route path="/crm/login" element={<CRMLoginPage />} />

          {/* Protected CRM routes — CRMLayout handles auth check internally */}
          <Route path="/crm" element={<CRMLayout />}>
            <Route index element={<Navigate to="/crm/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;