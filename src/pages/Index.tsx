
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import InvoiceManager from '../components/InvoiceManager';
import ClientManager from '../components/ClientManager';
import DatabaseManager from '../components/DatabaseManager';
import Settings from '../components/Settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'invoices':
        return <InvoiceManager />;
      case 'clients':
        return <ClientManager />;
      case 'database':
        return <DatabaseManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <div className="flex">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 lg:ml-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
