
import React from 'react';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const handleNavigate = (tab: string) => {
    // For now, we'll handle navigation through React Router instead
    console.log('Navigate to:', tab);
  };

  return <Dashboard onNavigate={handleNavigate} />;
};

export default Index;
