import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, Eye, FileText, MessageSquare, Activity } from 'lucide-react';

interface AgentBadgeProps {
  agentName: string;
  action: 'flag' | 'approve' | 'suggest' | 'log' | 'verify';
  details: string;
  timestamp: Date;
  animated?: boolean;
}

const AgentBadge: React.FC<AgentBadgeProps> = ({ 
  agentName, 
  action, 
  details, 
  timestamp, 
  animated = true 
}) => {
  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'PolicyEnforcerAgent':
        return Shield;
      case 'VerifierAgent':
        return Eye;
      case 'AuditLoggerAgent':
        return FileText;
      case 'ResponseAgent':
        return MessageSquare;
      case 'FeedbackAgent':
        return Activity;
      default:
        return Shield;
    }
  };

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'flag':
        return {
          icon: XCircle,
          color: 'bg-red-50 text-red-700 border-red-200',
          iconColor: 'text-red-500',
          emoji: '🚫'
        };
      case 'approve':
        return {
          icon: CheckCircle,
          color: 'bg-green-50 text-green-700 border-green-200',
          iconColor: 'text-green-500',
          emoji: '✅'
        };
      case 'verify':
        return {
          icon: CheckCircle,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          iconColor: 'text-blue-500',
          emoji: '🔍'
        };
      case 'suggest':
        return {
          icon: AlertTriangle,
          color: 'bg-orange-50 text-orange-700 border-orange-200',
          iconColor: 'text-orange-500',
          emoji: '💡'
        };
      case 'log':
        return {
          icon: Clock,
          color: 'bg-slate-50 text-slate-600 border-slate-200',
          iconColor: 'text-slate-500',
          emoji: '📝'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-slate-50 text-slate-600 border-slate-200',
          iconColor: 'text-slate-500',
          emoji: '⚡'
        };
    }
  };

  const AgentIcon = getAgentIcon(agentName);
  const actionConfig = getActionConfig(action);
  const ActionIcon = actionConfig.icon;

  const formatAgentName = (name: string) => {
    return name.replace('Agent', '').replace(/([A-Z])/g, ' $1').trim();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8, y: 20 } : false}
      animate={animated ? { opacity: 1, scale: 1, y: 0 } : false}
      whileHover={{ scale: 1.02 }}
      className={`flex items-center justify-between p-3 rounded-lg border ${actionConfig.color} transition-all duration-200 shadow-sm`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <AgentIcon className={`h-4 w-4 ${actionConfig.iconColor}`} />
          <ActionIcon className={`h-4 w-4 ${actionConfig.iconColor}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              {formatAgentName(agentName)}
            </span>
            <span className="text-sm">{actionConfig.emoji}</span>
          </div>
          <p className="text-xs opacity-80 mt-1 leading-relaxed">{details}</p>
        </div>
      </div>
      
      <div className="text-right">
        <span className="text-xs opacity-60 font-mono">
          {formatTime(timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default AgentBadge;