import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Settings, Zap } from 'lucide-react';
import { isGroqConfigured } from '../lib/groqAgent';

interface GroqStatusProps {
  onConfigureClick?: () => void;
}

const GroqStatus: React.FC<GroqStatusProps> = ({ onConfigureClick }) => {
  const isConfigured = isGroqConfigured();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border ${
        isConfigured 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          <div>
            <h3 className={`font-medium ${
              isConfigured ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Groq Gemma 2 9B {isConfigured ? 'Connected' : 'Not Configured'}
            </h3>
            <p className={`text-sm ${
              isConfigured ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {isConfigured 
                ? 'Ultra-fast LLM inference enabled' 
                : 'Add API key to enable real LLM responses'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className={`h-5 w-5 ${
            isConfigured ? 'text-green-600' : 'text-yellow-600'
          }`} />
          {!isConfigured && onConfigureClick && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfigureClick}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </motion.button>
          )}
        </div>
      </div>
      
      {!isConfigured && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>To enable Groq Gemma 2 9B:</strong>
          </p>
          <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
            <li>Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline">Groq Console</a></li>
            <li>Add <code className="bg-yellow-200 px-1 rounded">VITE_GROQ_API_KEY=your_key</code> to your .env file</li>
            <li>Restart the development server</li>
          </ol>
          <div className="mt-2 p-2 bg-yellow-200 rounded text-xs">
            <strong>Benefits:</strong> Ultra-fast inference (up to 500+ tokens/sec), high-quality responses, cost-effective
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GroqStatus;