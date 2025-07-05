import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SafetyBadgeProps {
  status: 'safe' | 'flagged' | 'blocked';
  violationCount?: number;
  animated?: boolean;
}

const SafetyBadge: React.FC<SafetyBadgeProps> = ({ 
  status, 
  violationCount = 0, 
  animated = true 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600',
          label: '✅ SAFE',
          description: 'No violations detected'
        };
      case 'flagged':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600',
          label: '⚠️ FLAGGED',
          description: `${violationCount} violation${violationCount !== 1 ? 's' : ''} detected`
        };
      case 'blocked':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600',
          label: '❌ BLOCKED',
          description: `${violationCount} violation${violationCount !== 1 ? 's' : ''} detected`
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${config.color} font-medium text-sm`}
    >
      <Shield className={`h-4 w-4 ${config.iconColor}`} />
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <span>{config.label}</span>
      {violationCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-xs font-bold"
        >
          {violationCount}
        </motion.span>
      )}
    </motion.div>
  );
};

export default SafetyBadge;