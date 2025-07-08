import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown, 
  Flag,
  Shield,
  AlertCircle,
  Zap,
  AlertOctagon
} from 'lucide-react';
import { LLMInteraction } from '../types';
import { format } from 'date-fns';
import AgentBadge from './AgentBadge';
import SafetyBadge from './SafetyBadge';

interface InteractionCardProps {
  interaction: LLMInteraction;
  onAction: (id: string, action: 'approve' | 'block' | 'feedback', rating?: 'positive' | 'negative' | 'flag') => void;
}

const InteractionCard: React.FC<InteractionCardProps> = ({ interaction, onAction }) => {
  const getStatusIcon = () => {
    switch (interaction.status) {
      case 'approved':
        return <SafetyBadge status="safe" />;
      case 'blocked':
        return <SafetyBadge status="blocked" violationCount={interaction.violations.length} />;
      case 'pending':
        return <SafetyBadge status="flagged" violationCount={interaction.violations.length} />;
    }
  };

  const getSeverityColor = () => {
    switch (interaction.severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const getViolationColor = (type: string) => {
    switch (type) {
      case 'pii':
        return 'bg-red-100 text-red-800';
      case 'misinformation':
        return 'bg-orange-100 text-orange-800';
      case 'bias':
        return 'bg-purple-100 text-purple-800';
      case 'hallucination':
        return 'bg-yellow-100 text-yellow-800';
      case 'hate_speech':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'pii':
        return <Shield className="h-4 w-4" />;
      case 'misinformation':
        return <AlertCircle className="h-4 w-4" />;
      case 'bias':
        return <AlertTriangle className="h-4 w-4" />;
      case 'hallucination':
        return <AlertTriangle className="h-4 w-4" />;
      case 'hate_speech':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="font-semibold text-gray-900">ID: {interaction.id}</h3>
            <p className="text-sm text-gray-500">
              {format(interaction.timestamp, 'MMM dd, yyyy HH:mm:ss')}
            </p>
            {interaction.llmSource && (
              <div className="flex items-center space-x-2 mt-1">
                {interaction.llmSource === 'groq' ? (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <Zap className="h-3 w-3" />
                    <span>Groq Gemma 2 9B</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-orange-600">
                    <AlertOctagon className="h-3 w-3" />
                    <span>⚠️ Fallback mode</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {getStatusIcon()}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor()}`}>
            {interaction.severity.toUpperCase()}
          </span>
          {interaction.violations.length > 0 && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">{interaction.violations.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Input:</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {interaction.input}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Output:</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {interaction.output}
          </p>
        </div>

        {interaction.violations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Violations:</h4>
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {interaction.violations.map((violation, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start justify-between p-3 bg-red-50 rounded-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      {getViolationIcon(violation.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getViolationColor(violation.type)}`}>
                        {violation.type.toUpperCase()}
                      </span>
                      {violation.regulatoryFramework && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {violation.regulatoryFramework}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{violation.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{violation.reason}</p>
                    {violation.remediationSteps && violation.remediationSteps.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Remediation Steps:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                          {violation.remediationSteps.slice(0, 2).map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                          {violation.remediationSteps.length > 2 && (
                            <li className="text-gray-500">+{violation.remediationSteps.length - 2} more...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {violation.severity.toFixed(1)}/10
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {(violation.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">conf.</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {interaction.agentActions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Agent Actions:</h4>
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {interaction.agentActions.map((action, index) => (
                <AgentBadge
                  key={index}
                  agentName={action.agentName}
                  action={action.action as any}
                  details={action.details}
                  timestamp={action.timestamp}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(interaction.id, 'feedback', 'positive')}
            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">Helpful</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(interaction.id, 'feedback', 'negative')}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="text-sm">Not Helpful</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(interaction.id, 'feedback', 'flag')}
            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700"
          >
            <Flag className="h-4 w-4" />
            <span className="text-sm">Report</span>
          </motion.button>
        </div>

        {interaction.status === 'pending' && (
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(interaction.id, 'approve')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Approve
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(interaction.id, 'block')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Block
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InteractionCard;