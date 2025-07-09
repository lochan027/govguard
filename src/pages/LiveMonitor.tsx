import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractionCard from '../components/InteractionCard';
import PromptTester from '../components/PromptTester';
import { apiService } from '../api/apiService';
import { LLMInteraction } from '../types';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import EmptyState from '../components/EmptyState';
import { Activity } from 'lucide-react';

const LiveMonitor: React.FC = () => {
  const [interactions, setInteractions] = useState<LLMInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchInteractions = async () => {
      const data = await apiService.getInteractions();
      setInteractions(data);
    };

    fetchInteractions();
    const interval = setInterval(fetchInteractions, 3000);

    return () => clearInterval(interval);
  }, []);

  const handlePromptSubmit = async (prompt: string) => {
    setIsLoading(true);
    try {
      const interaction = await apiService.processPrompt(prompt);
      setInteractions(prev => [interaction, ...prev]);
      
      // Show toast based on result
      if (interaction.status === 'blocked') {
        toast.error('Prompt Blocked', `${interaction.violations.length} violation(s) detected`);
      } else if (interaction.status === 'pending') {
        toast.warning('Prompt Flagged', 'Content requires review');
      } else {
        toast.success('Prompt Approved', 'No violations detected');
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error('Processing Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteractionAction = async (id: string, action: string, rating?: 'positive' | 'negative' | 'flag') => {
    if (action === 'feedback' && rating) {
      try {
        await apiService.submitFeedback(id, rating);
        toast.success('Feedback Submitted', 'Thank you for your feedback!');
        
        // Trigger feedback agent processing
        const interactions = await apiService.getInteractions();
        setInteractions(interactions);
      } catch (error) {
        toast.error('Feedback Failed', 'Unable to submit feedback');
      }
      
      // Only update feedback, don't change status
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === id 
            ? { 
                ...interaction, 
                userFeedback: {
                  rating,
                  timestamp: new Date()
                }
              }
            : interaction
        )
      );
      return;
    }
    
    // Handle approve/block actions
    if (action === 'approve') {
      // Update status immediately for UI feedback
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === id 
            ? { ...interaction, status: 'approved' as const }
            : interaction
        )
      );
      toast.success('Interaction Approved', 'Content has been approved for use');
    } else if (action === 'block') {
      // Update status immediately for UI feedback
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === id 
            ? { ...interaction, status: 'blocked' as const }
            : interaction
        )
      );
      toast.error('Interaction Blocked', 'Content has been blocked due to violations');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Live Monitor</h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Real-time monitoring</span>
        </div>
      </div>

      <PromptTester onSubmit={handlePromptSubmit} isLoading={isLoading} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Interactions ({interactions.length})
        </h2>
        
        {interactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <EmptyState
              icon={Activity}
              title="No interactions yet"
              description="Submit a prompt above to test the AI governance system and see how our agents analyze and respond to different types of content."
              action={{
                label: "Try a Sample Prompt",
                onClick: () => {
                  // This would scroll to the prompt tester
                  document.querySelector('textarea')?.focus();
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                onAction={handleInteractionAction}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveMonitor;