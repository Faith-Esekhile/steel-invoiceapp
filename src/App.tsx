
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import Dashboard from "@/components/Dashboard";
import ClientManager from "@/components/ClientManager";
import InvoiceManager from "@/components/InvoiceManager";
import InvoiceView from "@/components/InvoiceView";
import Inventory from "@/components/Inventory";
import WarehouseManager from "@/components/WarehouseManager";
import CompanyExpenses from "@/components/CompanyExpenses";
import Profit from "@/components/Profit";
import Settings from "@/components/Settings";
import DatabaseManager from "@/components/DatabaseManager";
import AuthPage from "@/components/auth/AuthPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 flex">
                    <div className="w-64 flex-shrink-0">
                      <Navigation />
                    </div>
                    <div className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/clients" element={<ClientManager />} />
                        <Route path="/invoices" element={<InvoiceManager />} />
                        <Route path="/invoices/:id" element={<InvoiceView />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/warehouses" element={<WarehouseManager />} />
                        <Route path="/expenses" element={<CompanyExpenses />} />
                        <Route path="/profit" element={<Profit />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/database" element={<DatabaseManager />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
