/**
 * GENERAL HANDLER
 * Handles all other intents: questions, scheduling, complaints, internal, unknown
 */

const airtable = require('../services/airtable');
const config = require('../config/agent-config');

class GeneralHandler {
  /**
   * Handle general emails
   */
  async handle(email, context, analysis, commId) {
    console.log(`GeneralHandler: Processing ${analysis.intent}`);

    const intent = analysis.intent;
    const requiresHuman = config.intents[intent]?.requiresHumanApproval || analysis.requiresHumanReview;

    // For complaints, add priority flag
    if (intent === 'COMPLAINT') {
      try {
        await airtable.base(config.tables.communications).update(commId, {
          'Notes': `⚠️ COMPLAINT - Priority review needed\n${analysis.internalNotes || ''}`
        });
      } catch (error) {
        console.error('Error updating communication:', error);
      }

      return {
        status: 'flagged_for_review',
        action: 'FLAG_FOR_HUMAN',
        reason: 'Complaint requires human attention',
        priority: 'high',
        draftResponse: analysis.draftResponse
      };
    }

    // For internal emails
    if (intent === 'INTERNAL') {
      return {
        status: 'logged',
        action: 'LOG_ONLY',
        reason: 'Internal communication logged',
        priority: 'low'
      };
    }

    // For scheduling
    if (intent === 'SCHEDULING') {
      return {
        status: requiresHuman ? 'flagged_for_review' : 'processed',
        action: requiresHuman ? 'FLAG_FOR_HUMAN' : 'DRAFT_RESPONSE',
        reason: 'Scheduling request',
        priority: 'medium',
        draftResponse: analysis.draftResponse
      };
    }

    // For questions and pricing requests
    if (intent === 'QUESTION' || intent === 'PRICING_REQUEST') {
      // Check if we have pricing on file
      if (intent === 'PRICING_REQUEST' && context.pricing.length > 0) {
        // We have pricing - can potentially auto-respond
        return {
          status: 'processed',
          action: 'DRAFT_RESPONSE',
          reason: 'Pricing available on file',
          priority: 'medium',
          draftResponse: analysis.draftResponse,
          pricingData: context.pricing
        };
      }

      return {
        status: requiresHuman ? 'flagged_for_review' : 'processed',
        action: requiresHuman ? 'FLAG_FOR_HUMAN' : 'DRAFT_RESPONSE',
        reason: `${intent} - ${requiresHuman ? 'needs review' : 'can auto-respond'}`,
        priority: 'low',
        draftResponse: analysis.draftResponse
      };
    }

    // For unknown intent
    if (intent === 'UNKNOWN') {
      return {
        status: 'flagged_for_review',
        action: 'FLAG_FOR_HUMAN',
        reason: 'Could not determine intent',
        priority: 'medium',
        confidence: analysis.confidence
      };
    }

    // Default fallback
    return {
      status: 'logged',
      action: 'LOG_ONLY',
      reason: `${intent} processed`,
      priority: 'low'
    };
  }
}

module.exports = new GeneralHandler();
