
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Database, 
  Settings, 
  Menu, 
  X,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'database', label: 'Database Manager', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-steel-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="lg:hidden mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Marvellous Steel</h1>
                <p className="text-xs text-steel-600">Enterprise Solutions</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-steel-600 hidden md:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-steel-200 z-50 transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-6 border-b border-steel-200 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Marvellous Steel</h1>
                <p className="text-xs text-steel-600">Enterprise</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'text-steel-700 hover:bg-steel-100'
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Spacer for fixed sidebar on large screens */}
      <div className="hidden lg:block lg:w-64"></div>
    </>
  );
};

export default Navigation;
