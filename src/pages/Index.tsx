
import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import InvoiceManager from '@/components/InvoiceManager';
import ClientManager from '@/components/ClientManager';
import DatabaseManager from '@/components/DatabaseManager';
import Settings from '@/components/Settings';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'invoices':
        return <InvoiceManager />;
      case 'clients':
        return <ClientManager />;
      case 'database':
        return <DatabaseManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-steel-50 flex">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default Index;
