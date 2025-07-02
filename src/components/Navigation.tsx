
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  Receipt, 
  TrendingUp,
  Settings,
  Warehouse
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/invoices', icon: FileText, label: 'Invoices' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
    { path: '/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/profit', icon: TrendingUp, label: 'Profit & Loss' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white shadow-sm border-r">
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Manager</h2>
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
