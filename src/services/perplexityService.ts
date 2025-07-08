import { perplexityConfig } from '../config/perplexity';

export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface VerificationResult {
  isAccurate: boolean;
  confidence: number;
  summary: string;
  sources?: string[];
  reasoning?: string;
}

export class PerplexityService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = perplexityConfig.apiKey;
    this.apiUrl = perplexityConfig.apiUrl;
    this.model = perplexityConfig.model;
  }

  async verifyContent(content: string): Promise<VerificationResult> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const prompt = this.buildVerificationPrompt(content);
      const response = await this.callPerplexityAPI(prompt);
      
      return this.parseVerificationResponse(response);
    } catch (error) {
      console.error('Perplexity verification failed:', error);
      throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async factCheck(claim: string): Promise<VerificationResult> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const prompt = this.buildFactCheckPrompt(claim);
      const response = await this.callPerplexityAPI(prompt);
      
      return this.parseVerificationResponse(response);
    } catch (error) {
      console.error('Perplexity fact-check failed:', error);
      throw new Error(`Fact-check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callPerplexityAPI(prompt: string): Promise<PerplexityResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), perplexityConfig.timeout);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a fact-checking assistant. Analyze the provided content for accuracy and provide a structured response with verification status, confidence level, and reasoning.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: perplexityConfig.maxTokens,
          temperature: perplexityConfig.temperature,
          return_citations: true,
          return_images: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Perplexity API request timed out');
      }
      
      throw error;
    }
  }

  private buildVerificationPrompt(content: string): string {
    return `Please verify the accuracy of the following content and provide a structured analysis:

Content to verify:
"${content}"

Please respond in the following JSON format:
{
  "isAccurate": true/false,
  "confidence": 0.0-1.0,
  "summary": "Brief explanation of verification result",
  "reasoning": "Detailed reasoning for the assessment",
  "sources": ["list of relevant sources if available"]
}

Focus on:
1. Factual accuracy of claims made
2. Presence of misinformation or false statements
3. Consistency with current knowledge and reliable sources
4. Any potential red flags or concerning content

Be thorough but concise in your analysis.`;
  }

  private buildFactCheckPrompt(claim: string): string {
    return `Please fact-check the following claim and provide a detailed analysis:

Claim to fact-check:
"${claim}"

Please respond in the following JSON format:
{
  "isAccurate": true/false,
  "confidence": 0.0-1.0,
  "summary": "Brief fact-check result",
  "reasoning": "Detailed explanation with evidence",
  "sources": ["relevant sources that support or refute the claim"]
}

Evaluate:
1. Whether the claim is factually correct
2. Supporting or contradicting evidence
3. Context and nuance around the claim
4. Reliability of available information

Provide a confidence score based on the strength of available evidence.`;
  }

  private parseVerificationResponse(response: PerplexityResponse): VerificationResult {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in Perplexity response');
      }

      // First try to extract JSON from markdown code blocks
      let jsonString = this.extractJsonFromMarkdown(content);
      
      // If no markdown block found, try to find JSON object in text
      if (!jsonString) {
        jsonString = this.extractJsonFromText(content);
      }
      
      // Try to parse the extracted JSON
      if (jsonString) {
        const parsed = JSON.parse(jsonString);
        return {
          isAccurate: parsed.isAccurate || false,
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
          summary: parsed.summary || 'Verification completed',
          sources: parsed.sources || [],
          reasoning: parsed.reasoning || content
        };
      }

      // Fallback: analyze text response
      const isAccurate = this.analyzeTextForAccuracy(content);
      const confidence = this.extractConfidenceFromText(content);

      return {
        isAccurate,
        confidence,
        summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        reasoning: content
      };
    } catch (error) {
      console.error('Failed to parse Perplexity response:', error);
      
      // Return conservative result on parsing failure
      return {
        isAccurate: false,
        confidence: 0.5,
        summary: 'Unable to parse verification response',
        reasoning: 'Response parsing failed, treating as potentially inaccurate for safety'
      };
    }
  }

  private extractJsonFromMarkdown(content: string): string | null {
    // Look for JSON in markdown code blocks
    const markdownJsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
    if (markdownJsonMatch) {
      return markdownJsonMatch[1].trim();
    }
    return null;
  }

  private extractJsonFromText(content: string): string | null {
    // Find the first '{' and the last '}' to extract potential JSON
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      const potentialJson = content.substring(firstBrace, lastBrace + 1);
      
      // Basic validation - check if it looks like JSON structure
      if (this.isValidJsonStructure(potentialJson)) {
        return potentialJson;
      }
    }
    
    return null;
  }

  private isValidJsonStructure(str: string): boolean {
    // Basic checks for JSON-like structure
    const trimmed = str.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      return false;
    }
    
    // Count braces to ensure they're balanced
    let braceCount = 0;
    for (const char of trimmed) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (braceCount < 0) return false;
    }
    
    return braceCount === 0;
  }

  private analyzeTextForAccuracy(text: string): boolean {
    const inaccurateIndicators = [
      'false', 'incorrect', 'inaccurate', 'misleading', 'misinformation',
      'not true', 'fabricated', 'unverified', 'disputed', 'debunked'
    ];
    
    const accurateIndicators = [
      'accurate', 'correct', 'true', 'verified', 'confirmed',
      'supported by evidence', 'factual', 'reliable'
    ];

    const textLower = text.toLowerCase();
    
    const inaccurateScore = inaccurateIndicators.reduce((score, indicator) => 
      score + (textLower.includes(indicator) ? 1 : 0), 0);
    
    const accurateScore = accurateIndicators.reduce((score, indicator) => 
      score + (textLower.includes(indicator) ? 1 : 0), 0);

    return accurateScore > inaccurateScore;
  }

  private extractConfidenceFromText(text: string): number {
    // Look for confidence percentages
    const percentageMatch = text.match(/(\d+)%/);
    if (percentageMatch) {
      return parseInt(percentageMatch[1]) / 100;
    }

    // Look for confidence words
    const confidenceWords = {
      'very confident': 0.9,
      'highly confident': 0.9,
      'confident': 0.8,
      'likely': 0.7,
      'probably': 0.6,
      'possibly': 0.5,
      'uncertain': 0.4,
      'unlikely': 0.3,
      'doubtful': 0.2
    };

    const textLower = text.toLowerCase();
    for (const [phrase, confidence] of Object.entries(confidenceWords)) {
      if (textLower.includes(phrase)) {
        return confidence;
      }
    }

    return 0.7; // Default moderate confidence
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }
}

export const perplexityService = new PerplexityService();

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isAccurate: parsed.isAccurate || false,
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
          summary: parsed.summary || 'Verification completed',
          sources: parsed.sources || [],
          reasoning: parsed.reasoning || content
        };
      }

      // Fallback: analyze text response
      const isAccurate = this.analyzeTextForAccuracy(content);
      const confidence = this.extractConfidenceFromText(content);

      return {
        isAccurate,
        confidence,
        summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        reasoning: content
      };
    } catch (error) {
      console.error('Failed to parse Perplexity response:', error);
      
      // Return conservative result on parsing failure
      return {
        isAccurate: false,
        confidence: 0.5,
        summary: 'Unable to parse verification response',
        reasoning: 'Response parsing failed, treating as potentially inaccurate for safety'
      };
    }
  }

  private analyzeTextForAccuracy(text: string): boolean {
    const inaccurateIndicators = [
      'false', 'incorrect', 'inaccurate', 'misleading', 'misinformation',
      'not true', 'fabricated', 'unverified', 'disputed', 'debunked'
    ];
    
    const accurateIndicators = [
      'accurate', 'correct', 'true', 'verified', 'confirmed',
      'supported by evidence', 'factual', 'reliable'
    ];

    const textLower = text.toLowerCase();
    
    const inaccurateScore = inaccurateIndicators.reduce((score, indicator) => 
      score + (textLower.includes(indicator) ? 1 : 0), 0);
    
    const accurateScore = accurateIndicators.reduce((score, indicator) => 
      score + (textLower.includes(indicator) ? 1 : 0), 0);

    return accurateScore > inaccurateScore;
  }

  private extractConfidenceFromText(text: string): number {
    // Look for confidence percentages
    const percentageMatch = text.match(/(\d+)%/);
    if (percentageMatch) {
      return parseInt(percentageMatch[1]) / 100;
    }

    // Look for confidence words
    const confidenceWords = {
      'very confident': 0.9,
      'highly confident': 0.9,
      'confident': 0.8,
      'likely': 0.7,
      'probably': 0.6,
      'possibly': 0.5,
      'uncertain': 0.4,
      'unlikely': 0.3,
      'doubtful': 0.2
    };

    const textLower = text.toLowerCase();
    for (const [phrase, confidence] of Object.entries(confidenceWords)) {
      if (textLower.includes(phrase)) {
        return confidence;
      }
    }

    return 0.7; // Default moderate confidence
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }
}

export const perplexityService = new PerplexityService();