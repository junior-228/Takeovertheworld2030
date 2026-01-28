/**
 * INVOICE HANDLER
 * Handles invoice-related emails: disputes, questions, payment issues
 * Always flags for human review due to financial nature
 */

const airtable = require('../services/airtable');
const config = require('../config/agent-config');

class InvoiceHandler {
  /**
   * Handle invoice-related emails
   */
  async handle(email, context, analysis, commId) {
    console.log('InvoiceHandler: Processing invoice issue');

    const extracted = analysis.extractedData;

    // Log the details
    const details = {
      invoiceNumber: extracted.invoiceNumber,
      amount: extracted.amount,
      issue: analysis.summary
    };

    console.log('Invoice issue details:', details);

    // Invoice matters ALWAYS need human review
    // But we can still prepare information and draft a response

    // Try to find related orders if invoice number is provided
    let relatedOrders = [];
    if (extracted.invoiceNumber) {
      // You could add an invoice table lookup here
      // For now, we'll note it for the human reviewer
    }

    // Update communication with extracted data
    try {
      await airtable.base(config.tables.communications).update(commId, {
        'Notes': `INVOICE ISSUE - Requires human review\n` +
                 `Invoice #: ${extracted.invoiceNumber || 'Not specified'}\n` +
                 `Amount: ${extracted.amount || 'Not specified'}\n` +
                 `Issue: ${analysis.summary}`
      });
    } catch (error) {
      console.error('Error updating communication:', error);
    }

    return {
      status: 'flagged_for_review',
      action: 'FLAG_FOR_HUMAN',
      reason: 'Invoice issues require human review',
      details,
      draftResponse: analysis.draftResponse,
      priority: 'high'
    };
  }
}

module.exports = new InvoiceHandler();
