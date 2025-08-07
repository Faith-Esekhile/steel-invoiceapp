
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Dashboard from "@/components/Dashboard";
import ClientManager from "@/components/ClientManager";
import InvoiceManager from "@/components/InvoiceManager";
import BackdatedInvoiceManager from "@/components/BackdatedInvoiceManager";
import InvoiceView from "@/components/InvoiceView";
import Inventory from "@/components/Inventory";
import WarehouseManager from "@/components/WarehouseManager";
import CompanyExpenses from "@/components/CompanyExpenses";
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
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <AppSidebar />
                      <main className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-12 flex items-center border-b bg-background px-4 lg:hidden">
                          <SidebarTrigger className="mr-2" />
                          <h1 className="text-lg font-semibold truncate">Marvellous Steel</h1>
                        </header>
                        <div className="flex-1 overflow-auto p-4 md:p-6">
                          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/clients" element={<ClientManager />} />
              <Route path="/invoices" element={<InvoiceManager />} />
              <Route path="/backdated-invoices" element={<BackdatedInvoiceManager />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/warehouses" element={<WarehouseManager />} />
              <Route path="/expenses" element={<CompanyExpenses />} />
              <Route path="/settings" element={<Settings />} />
                            <Route path="/database" element={<DatabaseManager />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </SidebarProvider>
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
