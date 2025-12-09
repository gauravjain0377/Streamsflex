import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, Home, PlayCircle, Menu, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { DeviceType } from '../types';

const NavItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-primary text-white' : 'text-slate-400 hover:bg-card hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const DeviceBadge = () => {
  const { deviceType } = useDevice();
  const getIcon = () => {
    switch(deviceType) {
      case DeviceType.MOBILE: return <Smartphone size={16} />;
      case DeviceType.TABLET: return <Tablet size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-slate-300">
      {getIcon()}
      <span className="capitalize">{deviceType} View</span>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-dark text-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-card/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <PlayCircle className="text-primary" size={28} />
          <span className="font-bold text-xl tracking-tight">StreamFlex</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-300">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center space-x-2 border-b border-slate-800/50">
            <PlayCircle className="text-primary" size={32} />
            <span className="font-bold text-2xl tracking-tight">StreamFlex</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem to="/" icon={Home} label="Discover" active={location.pathname === '/'} />
            <NavItem to="/upload" icon={Upload} label="Upload Video" active={location.pathname === '/upload'} />
            <NavItem to="/admin" icon={LayoutDashboard} label="Admin Dashboard" active={location.pathname === '/admin'} />
          </nav>

          <div className="p-6 border-t border-slate-800/50">
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2">Current Detection</p>
              <DeviceBadge />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto pt-20 lg:pt-0">
        <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};