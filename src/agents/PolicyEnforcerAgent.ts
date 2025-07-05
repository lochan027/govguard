import { LLMInteraction, AgentAction, Violation } from '../types';

export class PolicyEnforcerAgent {
  name = 'PolicyEnforcerAgent';
  type = 'policy' as const;
  enabled = true;

  async process(interaction: LLMInteraction): Promise<AgentAction[]> {
    const violations = await this.detectViolations(interaction);
    const actions: AgentAction[] = [];

    // Always log that the policy enforcer processed the interaction
    actions.push({
      agentName: this.name,
      action: 'log',
      details: 'Policy enforcer scanned content for violations',
      timestamp: new Date()
    });

    if (violations.length > 0) {
      actions.push({
        agentName: this.name,
        action: 'flag',
        details: `Detected ${violations.length} violation(s): ${violations.map(v => v.type).join(', ')}`,
        timestamp: new Date()
      });
    } else {
      actions.push({
        agentName: this.name,
        action: 'approve',
        details: 'No policy violations detected',
        timestamp: new Date()
      });
    }

    return actions;
  }

  private async detectViolations(interaction: LLMInteraction): Promise<Violation[]> {
    const violations: Violation[] = [];
    const text = interaction.output.toLowerCase();

    // PII Detection
    if (this.containsPII(text)) {
      violations.push({
        type: 'pii',
        description: 'Personal information detected in response',
        severity: 8.5,
        confidence: 0.85,
        reason: 'Response contains email addresses, phone numbers, or medical record IDs'
      });
    }

    // Hallucination Detection
    if (this.detectHallucination(text)) {
      violations.push({
        type: 'hallucination',
        description: 'Potential hallucination detected',
        severity: 6.5,
        confidence: 0.72,
        reason: 'Response contains uncertain language patterns indicating potential fabrication'
      });
    }

    // Bias Detection
    if (this.detectBias(text)) {
      violations.push({
        type: 'bias',
        description: 'Biased language detected',
        severity: 5.8,
        confidence: 0.68,
        reason: 'Response contains language that may reflect unfair bias or assumptions'
      });
    }

    // Hate Speech Detection
    if (this.detectHateSpeech(text)) {
      violations.push({
        type: 'hate_speech',
        description: 'Potentially harmful language detected',
        severity: 9.2,
        confidence: 0.91,
        reason: 'Response contains language that could be considered offensive or discriminatory'
      });
    }

    return violations;
  }

  private containsPII(text: string): boolean {
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{16}\b/, // Credit card
      /\b[\w\.-]+@[\w\.-]+\.\w+\b/, // Email
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone
      /patient.*?john.*?doe/i, // Medical example
      /medical.*?record.*?#?\d+/i
    ];

    return piiPatterns.some(pattern => pattern.test(text));
  }

  private detectHallucination(text: string): boolean {
    const hallucination_indicators = [
      'according to my knowledge',
      'i believe',
      'it seems like',
      'probably',
      'based on what i know'
    ];

    return hallucination_indicators.some(indicator => text.includes(indicator));
  }

  private detectBias(text: string): boolean {
    const biasPatterns = [
      /obviously/i,
      /everyone knows/i,
      /it's common sense/i,
      /naturally/i
    ];

    return biasPatterns.some(pattern => pattern.test(text));
  }

  private detectHateSpeech(text: string): boolean {
    const hateSpeechPatterns = [
      /\b(stupid|idiot|moron)\b/i,
      /\b(inferior|superior)\s+(race|gender|group)/i,
      /\b(all|every)\s+(women|men|people)\s+are\b/i
    ];

    return hateSpeechPatterns.some(pattern => pattern.test(text));
  }
}