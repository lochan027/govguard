import { LLMInteraction, AgentAction } from '../types';

export class FeedbackAgent {
  name = 'FeedbackAgent';
  type = 'feedback' as const;
  enabled = true;

  async process(interaction: LLMInteraction): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Always log that the feedback agent processed the interaction
    actions.push({
      agentName: this.name,
      action: 'log',
      details: 'Feedback agent initialized and ready to collect user feedback',
      timestamp: new Date()
    });

    if (interaction.userFeedback) {
      actions.push({
        agentName: this.name,
        action: 'log',
        details: `Collected user feedback: ${interaction.userFeedback.rating}`,
        timestamp: new Date()
      });

      await this.processFeedback(interaction);
    } else {
      // Log that we're waiting for feedback
      actions.push({
        agentName: this.name,
        action: 'log',
        details: 'Monitoring interaction for user feedback',
        timestamp: new Date()
      });
    }

    return actions;
  }

  private async processFeedback(interaction: LLMInteraction): Promise<void> {
    // In a real implementation, this would update model training data
    console.log('Feedback processed:', {
      interactionId: interaction.id,
      feedback: interaction.userFeedback,
      violations: interaction.violations
    });
  }
}