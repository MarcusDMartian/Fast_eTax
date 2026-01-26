import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useAppStore } from './store';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Main Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import LedgerPage from './pages/ledger/LedgerPage';
import TaxCalculatorPage from './pages/calculator/TaxCalculatorPage';
import DeclarationsPage from './pages/declarations/DeclarationsPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import BankIntegrationPage from './pages/bank/BankIntegrationPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import SupportPage from './pages/support/SupportPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Menu: {
            itemHoverBg: '#f0f5ff',
            itemSelectedBg: '#e6f4ff',
            itemSelectedColor: '#667eea',
          },
          Card: {
            headerBg: '#fafafa',
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ledger" element={<LedgerPage />} />
            <Route path="calculator" element={<TaxCalculatorPage />} />
            <Route path="declarations" element={<DeclarationsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="bank" element={<BankIntegrationPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
