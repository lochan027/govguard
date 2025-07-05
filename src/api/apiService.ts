import { LLMInteraction, DashboardStats, AgentSettings, AuditLogEntry, FeedbackEntry } from '../types';
import { agents } from '../agents';
import { firestoreService } from '../services/firestoreService';
import { mockApi } from './mockApi';
import { rateLimiter } from '../utils/rateLimiter';
import { InputSanitizer } from '../utils/inputSanitizer';
import { callGroq } from '../lib/groqAgent';

class ApiService {
  private useFirestore: boolean;

  constructor() {
    this.useFirestore = firestoreService.isConfigured();
    
    if (!this.useFirestore) {
      console.warn('Firebase not configured, falling back to mock API');
    }
  }

  private getClientIdentifier(): string {
    // In a real app, this would be based on user ID or IP address
    // For demo purposes, we'll use a simple browser fingerprint
    return `client_${navigator.userAgent.slice(0, 50)}`;
  }

  async processPrompt(prompt: string): Promise<LLMInteraction> {
    const clientId = this.getClientIdentifier();
    
    // Rate limiting
    if (!rateLimiter.isAllowed(clientId)) {
      const resetTime = rateLimiter.getResetTime(clientId);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`);
    }

    // Input sanitization
    const validation = InputSanitizer.validatePrompt(prompt);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.error}`);
    }

    const sanitizedPrompt = validation.sanitized!;

    // Generate LLM response using Groq
    const llmResult = await callGroq(sanitizedPrompt);
    
    const interaction: LLMInteraction = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      input: sanitizedPrompt,
      output: llmResult.response,
      status: 'pending',
      severity: 'low',
      violations: [],
      agentActions: [],
      llmSource: llmResult.source,
      llmModel: llmResult.model,
      llmError: llmResult.error
    };

    // Get current settings
    const settings = await this.getSettings();

    // Process through agents
    if (settings.policyEnforcer.enabled) {
      const policyActions = await agents.policyEnforcer.process(interaction);
      interaction.agentActions.push(...policyActions);
    }

    // Update violations and status
    if (interaction.agentActions.some(action => action.action === 'flag')) {
      interaction.violations = this.extractViolations(llmResult.response);
      
      // Check if any violation exceeds threshold
      const maxSeverity = Math.max(...interaction.violations.map(v => v.severity), 0);
      interaction.status = maxSeverity >= settings.severityThreshold ? 'blocked' : 'pending';
      interaction.severity = this.mapSeverityToCategory(maxSeverity);
    } else {
      interaction.status = 'approved';
      interaction.severity = 'low';
    }

    // Process through verifier if enabled and high severity
    if (settings.verifier.enabled && interaction.violations.some(v => v.severity >= 7)) {
      const verifierActions = await agents.verifier.process(interaction);
      interaction.agentActions.push(...verifierActions);
      
      // Re-evaluate status after verifier adds potential violations
      if (interaction.violations.length > 0) {
        const maxSeverity = Math.max(...interaction.violations.map(v => v.severity), 0);
        interaction.status = maxSeverity >= settings.severityThreshold ? 'blocked' : 'pending';
        interaction.severity = this.mapSeverityToCategory(maxSeverity);
      }
    }

    // Process through other agents
    if (settings.auditLogger.enabled) {
      const auditActions = await agents.auditLogger.process(interaction);
      interaction.agentActions.push(...auditActions);
    }

    if (settings.responseAgent.enabled) {
      const responseActions = await agents.responseAgent.process(interaction);
      interaction.agentActions.push(...responseActions);
    }

    if (settings.feedbackAgent.enabled) {
      const feedbackActions = await agents.feedbackAgent.process(interaction);
      interaction.agentActions.push(...feedbackActions);
    }

    // Log all agent actions to audit logs after processing
    await this.logAllAgentActions(interaction);
    // Save interaction
    if (this.useFirestore) {
      try {
        const firestoreId = await firestoreService.saveInteraction(interaction);
        interaction.id = firestoreId;
      } catch (error) {
        console.error('Failed to save to Firestore, using mock API:', error);
        // Fallback to mock API
        return await mockApi.processPrompt(prompt);
      }
    }

    return interaction;
  }

  private async logAllAgentActions(interaction: LLMInteraction): Promise<void> {
    if (!this.useFirestore) return;

    try {
      for (const action of interaction.agentActions) {
        const logEntry: AuditLogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: action.timestamp,
          agentName: action.agentName,
          action: action.action,
          interactionId: interaction.id,
          details: action.details
        };
        await firestoreService.saveAuditLog(logEntry);
      }
    } catch (error) {
      console.error('Failed to log agent actions to Firestore:', error);
    }
  }

  async getInteractions(): Promise<LLMInteraction[]> {
    if (this.useFirestore) {
      try {
        return await firestoreService.getInteractions();
      } catch (error) {
        console.error('Failed to fetch from Firestore, using mock API:', error);
        return await mockApi.getInteractions();
      }
    }
    return await mockApi.getInteractions();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    if (this.useFirestore) {
      try {
        return await firestoreService.getDashboardStats();
      } catch (error) {
        console.error('Failed to fetch stats from Firestore, using mock API:', error);
        return await mockApi.getDashboardStats();
      }
    }
    return await mockApi.getDashboardStats();
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    if (this.useFirestore) {
      try {
        return await firestoreService.getAuditLogs();
      } catch (error) {
        console.error('Failed to fetch audit logs from Firestore, using mock API:', error);
        return await mockApi.getAuditLogs();
      }
    }
    return await mockApi.getAuditLogs();
  }

  async getFeedbackEntries(): Promise<FeedbackEntry[]> {
    if (this.useFirestore) {
      try {
        return await firestoreService.getFeedback();
      } catch (error) {
        console.error('Failed to fetch feedback from Firestore, using mock API:', error);
        return await mockApi.getFeedbackEntries();
      }
    }
    return await mockApi.getFeedbackEntries();
  }

  async getSettings(): Promise<AgentSettings> {
    if (this.useFirestore) {
      try {
        return await firestoreService.getSettings();
      } catch (error) {
        console.error('Failed to fetch settings from Firestore, using mock API:', error);
        return await mockApi.getSettings();
      }
    }
    return await mockApi.getSettings();
  }

  async updateSettings(newSettings: AgentSettings): Promise<void> {
    if (this.useFirestore) {
      try {
        await firestoreService.saveSettings(newSettings);
      } catch (error) {
        console.error('Failed to save settings to Firestore, using mock API:', error);
        await mockApi.updateSettings(newSettings);
        return;
      }
    } else {
      await mockApi.updateSettings(newSettings);
    }
    
    // Update agent enabled states
    agents.policyEnforcer.enabled = newSettings.policyEnforcer.enabled;
    agents.verifier.enabled = newSettings.verifier.enabled;
    agents.auditLogger.enabled = newSettings.auditLogger.enabled;
    agents.responseAgent.enabled = newSettings.responseAgent.enabled;
    agents.feedbackAgent.enabled = newSettings.feedbackAgent.enabled;
  }

  async submitFeedback(interactionId: string, rating: 'positive' | 'negative' | 'flag', comment?: string): Promise<void> {
    const feedback: FeedbackEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      interactionId,
      rating,
      comment
    };

    if (this.useFirestore) {
      try {
        await firestoreService.saveFeedback(feedback);
        
        // Update interaction with feedback
        const interactions = await firestoreService.getInteractions();
        const interaction = interactions.find(i => i.id === interactionId);
        if (interaction) {
          await firestoreService.updateInteraction(interactionId, {
            userFeedback: {
              rating,
              comment,
              timestamp: new Date()
            }
          });
        }
      } catch (error) {
        console.error('Failed to save feedback to Firestore, using mock API:', error);
        await mockApi.submitFeedback(interactionId, rating, comment);
      }
    } else {
      await mockApi.submitFeedback(interactionId, rating, comment);
    }
  }

  private mapSeverityToCategory(severity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (severity >= 9) return 'critical';
    if (severity >= 7) return 'high';
    if (severity >= 5) return 'medium';
    return 'low';
  }

  private extractViolations(response: string) {
    const violations = [];
    const responseLower = response.toLowerCase();

    // PII detection
    if (responseLower.includes('john doe') || responseLower.includes('@email.com') || responseLower.includes('555-')) {
      violations.push({
        type: 'pii' as const,
        description: 'Personal information detected in response',
        severity: 8.5,
        confidence: 0.9,
        reason: 'Response contains email addresses, phone numbers, or medical record IDs'
      });
    }

    // Bias detection
    if (responseLower.includes('obviously') || responseLower.includes('everyone knows')) {
      violations.push({
        type: 'bias' as const,
        description: 'Biased language detected',
        severity: 5.8,
        confidence: 0.8,
        reason: 'Response contains language that may reflect unfair bias or assumptions'
      });
    }

    return violations;
  }

  isFirestoreConfigured(): boolean {
    return this.useFirestore;
  }
}

export const apiService = new ApiService();