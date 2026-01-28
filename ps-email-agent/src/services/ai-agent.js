/**
 * AI AGENT SERVICE
 * The "brain" - uses Claude to understand emails and decide actions
 */

const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/agent-config');

class AIAgent {
  constructor() {
    this._client = null;
  }

  getClient() {
    if (!this._client) {
      this._client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
    return this._client;
  }

  async processEmail(email, context) {
    console.log('\n========== Processing Email ==========');
    console.log('From:', email.from);
    console.log('Subject:', email.subject);
    console.log('Context:', context.contact?.name || 'Unknown contact');

    const systemPrompt = this.buildSystemPrompt();
    const contextPrompt = this.buildContextPrompt(context);
    const emailPrompt = this.buildEmailPrompt(email);

    const response = await this.getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: contextPrompt + '\n\n' + emailPrompt + '\n\nAnalyze this email and respond with JSON containing: intent, confidence, summary, extractedData, suggestedAction, draftResponse, internalNotes, requiresHumanReview, reasoning'
      }]
    });

    const result = this.parseAgentResponse(response.content[0].text);
    console.log('Intent:', result.intent, '(confidence:', result.confidence + ')');
    console.log('Action:', result.suggestedAction?.type);
    return result;
  }

  buildSystemPrompt() {
    const intents = Object.entries(config.intents).map(([k, v]) => '- ' + k + ': ' + v.description).join('\n');
    return 'You are an AI assistant for ' + config.identity.company + ' handling email operations.\n\n' +
      'INTENTS:\n' + intents + '\n\n' +
      'Return valid JSON only with: intent, confidence (0-1), summary, extractedData (quantity, product, grade, requestedDate, locationMentioned, poNumber, urgency, invoiceNumber, amount), suggestedAction (type, details), draftResponse, internalNotes, requiresHumanReview, reasoning';
  }

  buildContextPrompt(context) {
    let prompt = '=== CONTEXT ===\n';
    if (context.contact) {
      prompt += 'Contact: ' + context.contact.name + ' <' + context.contact.email + '>\n';
      prompt += 'Role: ' + (context.contact.role || 'Unknown') + '\n';
    }
    if (context.customer) {
      prompt += 'Customer: ' + context.customer.name + '\n';
    }
    if (context.communications && context.communications.length > 0) {
      prompt += '\nRecent Communications:\n';
      context.communications.slice(0, 5).forEach(c => {
        prompt += '- [' + c.date + '] ' + (c.aiSummary || c.body?.substring(0, 100) || 'No content') + '\n';
      });
    }
    if (context.orders && context.orders.length > 0) {
      prompt += '\nRecent Orders:\n';
      context.orders.slice(0, 3).forEach(o => {
        prompt += '- ' + (o.quantity || '?') + ' ' + (o.product || 'pallets') + ' (' + (o.status || 'unknown') + ')\n';
      });
    }
    return prompt;
  }

  buildEmailPrompt(email) {
    return '=== INCOMING EMAIL ===\nFrom: ' + (email.fromName || '') + ' <' + email.from + '>\nSubject: ' + email.subject + '\nBody: ' + (email.body || email.bodyPreview || '(empty)');
  }

  parseAgentResponse(text) {
    try {
      let json = text.trim();
      const match = json.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) json = match[1].trim();
      const p = JSON.parse(json);
      return {
        intent: p.intent || 'UNKNOWN',
        confidence: p.confidence || 0.5,
        summary: p.summary || 'Unable to summarize',
        extractedData: p.extractedData || {},
        suggestedAction: p.suggestedAction || { type: 'LOG_ONLY' },
        draftResponse: p.draftResponse || null,
        internalNotes: p.internalNotes || '',
        requiresHumanReview: p.requiresHumanReview !== false,
        reasoning: p.reasoning || ''
      };
    } catch (e) {
      console.error('Parse error:', e.message);
      return { intent: 'UNKNOWN', confidence: 0, summary: 'Parse failed', extractedData: {}, suggestedAction: { type: 'FLAG_FOR_HUMAN' }, requiresHumanReview: true, reasoning: 'JSON parse failed' };
    }
  }

  async generateResponse(purpose, context, instructions) {
    const resp = await this.getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'Write a professional email response for ' + config.identity.company,
      messages: [{ role: 'user', content: 'Purpose: ' + purpose + '\n' + (instructions || '') }]
    });
    return resp.content[0].text;
  }
}

module.exports = new AIAgent();
