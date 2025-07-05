import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  BarChart3, 
  FileText, 
  Settings, 
  AlertTriangle,
  Users,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'monitor', icon: Activity, label: 'Live Monitor' },
    { id: 'logs', icon: FileText, label: 'Audit Logs' },
    { id: 'violations', icon: AlertTriangle, label: 'Violations' },
    { id: 'agents', icon: Users, label: 'Agents' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-gray-900 text-white h-screen flex flex-col"
    >
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">GovGuard</h1>
            <p className="text-sm text-gray-400">AI Governance Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 mt-8">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
              activeTab === item.id
                ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">System Status</span>
          </div>
          <p className="text-xs text-gray-400">All agents operational</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;