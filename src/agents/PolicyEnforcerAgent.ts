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
      // Update the interaction's violations array
      interaction.violations.push(...violations);
      
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
    const inputText = interaction.input.toLowerCase();
    const outputText = interaction.output.toLowerCase();
    const combinedText = `${inputText} ${outputText}`;

    // 1. Illegal Activities Detection
    const illegalViolation = this.detectIllegalActivities(inputText, outputText);
    if (illegalViolation) violations.push(illegalViolation);

    // 2. PII Detection
    const piiViolation = this.detectPII(combinedText);
    if (piiViolation) violations.push(piiViolation);

    // 3. Misinformation Detection
    const misinformationViolation = this.detectMisinformation(inputText, outputText);
    if (misinformationViolation) violations.push(misinformationViolation);

    // 4. Hallucination Detection
    const hallucinationViolation = this.detectHallucination(outputText);
    if (hallucinationViolation) violations.push(hallucinationViolation);

    // 5. Bias Detection
    const biasViolation = this.detectBias(combinedText);
    if (biasViolation) violations.push(biasViolation);

    // 6. Hate Speech Detection
    const hateSpeechViolation = this.detectHateSpeech(combinedText);
    if (hateSpeechViolation) violations.push(hateSpeechViolation);

    // 7. Self-Harm Detection
    const selfHarmViolation = this.detectSelfHarm(combinedText);
    if (selfHarmViolation) violations.push(selfHarmViolation);

    // 8. Violence Detection
    const violenceViolation = this.detectViolence(combinedText);
    if (violenceViolation) violations.push(violenceViolation);

    return violations;
  }

  private detectIllegalActivities(input: string, output: string): Violation | null {
    const illegalPatterns = [
      // Hacking and cybercrime
      { pattern: /hack\s+into|hacking\s+into|break\s+into.*wifi|crack.*password|bypass.*security/i, type: 'cybercrime' },
      { pattern: /ddos|denial\s+of\s+service|botnet|malware|ransomware/i, type: 'cybercrime' },
      { pattern: /phishing|social\s+engineering.*hack|keylogger|trojan/i, type: 'cybercrime' },
      
      // Drug-related
      { pattern: /how\s+to\s+make.*drugs|synthesize.*cocaine|manufacture.*methamphetamine/i, type: 'drug_manufacturing' },
      { pattern: /buy.*illegal\s+drugs|sell.*drugs.*online|drug\s+dealer/i, type: 'drug_trafficking' },
      
      // Fraud and financial crimes
      { pattern: /credit\s+card\s+fraud|identity\s+theft|money\s+laundering/i, type: 'financial_crime' },
      { pattern: /fake\s+id|counterfeit.*money|tax\s+evasion/i, type: 'fraud' },
      
      // Violence and weapons
      { pattern: /make.*bomb|build.*explosive|create.*weapon/i, type: 'weapons' },
      { pattern: /assassination|murder.*plan|kill.*someone/i, type: 'violence_planning' },
      
      // Privacy violations
      { pattern: /stalk.*someone|spy\s+on.*without|hidden\s+camera/i, type: 'privacy_violation' },
      { pattern: /doxx|doxing|personal\s+information.*without\s+consent/i, type: 'privacy_violation' },
      
      // Copyright infringement
      { pattern: /pirate.*software|crack.*license|illegal\s+download/i, type: 'copyright' },
      
      // Human trafficking
      { pattern: /human\s+trafficking|sex\s+trafficking|forced\s+labor/i, type: 'trafficking' }
    ];

    for (const { pattern, type } of illegalPatterns) {
      if (pattern.test(input) || pattern.test(output)) {
        return {
          type: 'compliance',
          description: `Illegal activity detected: ${type}`,
          severity: 9.5,
          confidence: 0.9,
          reason: `Content involves potentially illegal activities related to ${type}`
        };
      }
    }

    return null;
  }

  private detectMisinformation(input: string, output: string): Violation | null {
    const misinformationPatterns = [
      // False historical claims
      { pattern: /elon\s+musk.*nobel\s+peace\s+prize/i, fact: 'Elon Musk has never won a Nobel Peace Prize' },
      { pattern: /bill\s+gates.*invented.*internet/i, fact: 'Bill Gates did not invent the internet' },
      { pattern: /covid.*5g|5g.*causes.*covid/i, fact: '5G does not cause COVID-19' },
      
      // Medical misinformation
      { pattern: /vaccines.*cause.*autism/i, fact: 'Vaccines do not cause autism - this has been thoroughly debunked' },
      { pattern: /bleach.*cure.*covid|hydroxychloroquine.*cure.*covid/i, fact: 'These are not proven COVID-19 cures' },
      { pattern: /essential\s+oils.*cure.*cancer/i, fact: 'Essential oils cannot cure cancer' },
      
      // Scientific misinformation
      { pattern: /earth.*flat|flat.*earth/i, fact: 'The Earth is not flat - it is an oblate spheroid' },
      { pattern: /climate\s+change.*hoax|global\s+warming.*fake/i, fact: 'Climate change is scientifically established' },
      { pattern: /evolution.*just.*theory.*not.*fact/i, fact: 'Evolution is both a theory and a fact in scientific terms' },
      
      // Technology misinformation
      { pattern: /microchips.*vaccines|bill\s+gates.*microchip/i, fact: 'Vaccines do not contain tracking microchips' },
      
      // Financial misinformation
      { pattern: /bitcoin.*guaranteed.*profit|crypto.*never.*lose/i, fact: 'Cryptocurrency investments carry significant risks' }
    ];

    for (const { pattern, fact } of misinformationPatterns) {
      if (pattern.test(input) || pattern.test(output)) {
        return {
          type: 'misinformation',
          description: 'Potential misinformation detected',
          severity: 8.0,
          confidence: 0.85,
          reason: `Content may contain false information. Fact: ${fact}`
        };
      }
    }

    // Check for common misinformation indicators
    const misinfoIndicators = [
      /doctors\s+don't\s+want\s+you\s+to\s+know/i,
      /big\s+pharma.*conspiracy/i,
      /mainstream\s+media.*hiding/i,
      /they\s+don't\s+want\s+you\s+to\s+know/i,
      /secret.*cure.*suppressed/i
    ];

    for (const indicator of misinfoIndicators) {
      if (indicator.test(input) || indicator.test(output)) {
        return {
          type: 'misinformation',
          description: 'Conspiracy theory language detected',
          severity: 6.5,
          confidence: 0.7,
          reason: 'Content uses language patterns common in misinformation'
        };
      }
    }

    return null;
  }

  private detectPII(text: string): Violation | null {
    const piiPatterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'SSN' },
      { pattern: /\b\d{16}\b/, type: 'Credit Card' },
      { pattern: /\b[\w\.-]+@[\w\.-]+\.\w+\b/, type: 'Email' },
      { pattern: /\b\d{3}-\d{3}-\d{4}\b/, type: 'Phone' },
      { pattern: /patient.*?john.*?doe/i, type: 'Medical Record' },
      { pattern: /medical.*?record.*?#?\d+/i, type: 'Medical Record' },
      { pattern: /driver.*license.*\d+/i, type: 'Driver License' },
      { pattern: /passport.*number.*\d+/i, type: 'Passport' }
    ];

    for (const { pattern, type } of piiPatterns) {
      if (pattern.test(text)) {
        return {
          type: 'pii',
          description: `Personal information detected: ${type}`,
          severity: 8.5,
          confidence: 0.9,
          reason: `Response contains ${type} which is personally identifiable information`
        };
      }
    }

    return null;
  }

  private detectHallucination(text: string): Violation | null {
    const hallucinationIndicators = [
      'according to my knowledge',
      'i believe',
      'it seems like',
      'probably',
      'based on what i know',
      'i think',
      'as far as i know',
      'i recall',
      'if i remember correctly'
    ];

    const foundIndicators = hallucinationIndicators.filter(indicator => 
      text.includes(indicator)
    );

    if (foundIndicators.length > 0) {
      return {
        type: 'hallucination',
        description: 'Potential hallucination detected',
        severity: 6.5,
        confidence: 0.72,
        reason: `Response contains uncertain language patterns: ${foundIndicators.join(', ')}`
      };
    }

    return null;
  }

  private detectBias(text: string): Violation | null {
    const biasPatterns = [
      { pattern: /obviously/i, type: 'assumption' },
      { pattern: /everyone knows/i, type: 'assumption' },
      { pattern: /it's common sense/i, type: 'assumption' },
      { pattern: /naturally/i, type: 'assumption' },
      { pattern: /all\s+(women|men|people)\s+are/i, type: 'generalization' },
      { pattern: /(women|men)\s+are\s+better\s+at/i, type: 'gender_bias' },
      { pattern: /people\s+from\s+\w+\s+are\s+usually/i, type: 'cultural_bias' }
    ];

    for (const { pattern, type } of biasPatterns) {
      if (pattern.test(text)) {
        return {
          type: 'bias',
          description: `Biased language detected: ${type}`,
          severity: 5.8,
          confidence: 0.75,
          reason: `Response contains language that may reflect unfair bias (${type})`
        };
      }
    }

    return null;
  }

  private detectHateSpeech(text: string): Violation | null {
    const hateSpeechPatterns = [
      { pattern: /\b(stupid|idiot|moron)\b/i, severity: 4.0 },
      { pattern: /\b(inferior|superior)\s+(race|gender|group)/i, severity: 8.5 },
      { pattern: /\b(all|every)\s+(women|men|people)\s+are\s+(stupid|worthless|inferior)/i, severity: 9.0 },
      { pattern: /(kill|murder|eliminate)\s+all\s+\w+/i, severity: 9.5 },
      { pattern: /\w+\s+should\s+(die|be\s+killed|not\s+exist)/i, severity: 9.0 }
    ];

    for (const { pattern, severity } of hateSpeechPatterns) {
      if (pattern.test(text)) {
        return {
          type: 'hate_speech',
          description: 'Potentially harmful language detected',
          severity,
          confidence: 0.85,
          reason: 'Response contains language that could be considered offensive or discriminatory'
        };
      }
    }

    return null;
  }

  private detectSelfHarm(text: string): Violation | null {
    const selfHarmPatterns = [
      /how\s+to\s+(kill|hurt)\s+myself/i,
      /suicide\s+methods/i,
      /ways\s+to\s+end\s+my\s+life/i,
      /self\s+harm\s+techniques/i,
      /cutting\s+myself/i
    ];

    for (const pattern of selfHarmPatterns) {
      if (pattern.test(text)) {
        return {
          type: 'compliance',
          description: 'Self-harm content detected',
          severity: 9.0,
          confidence: 0.9,
          reason: 'Content involves self-harm which requires immediate attention and professional help'
        };
      }
    }

    return null;
  }

  private detectViolence(text: string): Violation | null {
    const violencePatterns = [
      /how\s+to\s+hurt\s+someone/i,
      /ways\s+to\s+cause\s+pain/i,
      /torture\s+methods/i,
      /how\s+to\s+fight\s+dirty/i,
      /violent\s+revenge/i
    ];

    for (const pattern of violencePatterns) {
      if (pattern.test(text)) {
        return {
          type: 'compliance',
          description: 'Violent content detected',
          severity: 8.5,
          confidence: 0.85,
          reason: 'Content involves violence or harmful activities'
        };
      }
    }

    return null;
  }
}