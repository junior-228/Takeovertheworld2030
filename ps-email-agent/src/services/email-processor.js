/**
 * EMAIL PROCESSOR
 * Orchestrates the entire email processing flow
 * 1. Receive email
 * 2. Build context from Airtable
 * 3. Run through AI agent
 * 4. Execute actions
 * 5. Log everything
 */

const airtable = require('./airtable');
const emailService = require('./email');
const aiAgent = require('./ai-agent');
const config = require('../config/agent-config');

// Import handlers
const orderHandler = require('../handlers/order-handler');
const invoiceHandler = require('../handlers/invoice-handler');
const generalHandler = require('../handlers/general-handler');

class EmailProcessor {
  /**
   * Main entry point - process an incoming email
   */
  async processIncomingEmail(emailId) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing email: ${emailId}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // 1. Get the email content
      const email = await emailService.getEmail(emailId);
      console.log(`Subject: ${email.subject}`);
      console.log(`From: ${email.from}`);

      // 2. Build full context
      const context = await this.buildContext(email);

      // 3. Run through AI agent
      const analysis = await aiAgent.processEmail(email, context);

      // 4. ALWAYS log the communication first
      const commId = await this.logCommunication(email, context, analysis);
      console.log(`Communication logged: ${commId}`);

      // 5. Route to appropriate handler based on intent
      const result = await this.routeToHandler(email, context, analysis, commId);

      // 6. Send response if applicable
      if (analysis.draftResponse && !analysis.requiresHumanReview) {
        if (config.responses.draftForReview) {
          // Create draft for human review
          await emailService.createDraft(
            email.from,
            `Re: ${email.subject}`,
            analysis.draftResponse + config.responses.signatureTemplate
          );
          console.log('Draft response created for review');
        } else if (config.responses.autoReply) {
          // Send automatically
          await emailService.replyToEmail(
            email.id,
            analysis.draftResponse + config.responses.signatureTemplate
          );
          console.log('Auto-reply sent');
        }
      }

      console.log(`\nProcessing complete. Result: ${result.status}`);
      return {
        success: true,
        emailId,
        intent: analysis.intent,
        action: result.action,
        communicationId: commId
      };

    } catch (error) {
      console.error('Error processing email:', error);

      // Try to log the error
      try {
        await airtable.logCommunication({
          date: new Date().toISOString(),
          direction: 'inbound',
          channel: 'email',
          from: 'error',
          subject: `Processing Error: ${emailId}`,
          body: `Error: ${error.message}\n\nStack: ${error.stack}`,
          aiSummary: 'PROCESSING ERROR - needs manual review',
          parsed: false
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      return {
        success: false,
        emailId,
        error: error.message
      };
    }
  }

  /**
   * Build complete context for an email
   */
  async buildContext(email) {
    const context = {
      contact: null,
      customer: null,
      locations: [],
      communications: [],
      orders: [],
      pricing: []
    };

    // 1. Find the contact
    context.contact = await airtable.findContactByEmail(email.from);

    // If contact not found, create one
    if (!context.contact) {
      console.log(`New sender: ${email.from} - creating contact`);
      context.contact = await airtable.createContact({
        email: email.from,
        name: email.fromName || email.from.split('@')[0]
      });
      context.isNewContact = true;
    }

    // 2. Get customer details if we have a contact with customer link
    if (context.contact?.customerId) {
      context.customer = await airtable.getCustomerContext(context.contact.customerId);
    }

    // 3. Get location details
    if (context.contact?.locationIds?.length > 0) {
      context.locations = await Promise.all(
        context.contact.locationIds.map(id => airtable.getLocation(id))
      );
      context.locations = context.locations.filter(Boolean);
    }

    // 4. Get communication history (THE KEY!)
    if (context.contact?.id) {
      context.communications = await airtable.getRecentCommunications(
        context.contact.id,
        config.contextLimits.maxCommunications
      );
    }

    // 5. Get order history
    if (context.customer?.id) {
      context.orders = await airtable.getRecentOrders(
        context.customer.id,
        config.contextLimits.maxOrders
      );
    }

    // 6. Get pricing if available
    if (context.customer?.id) {
      context.pricing = await airtable.getPricing(context.customer.id);
    }

    console.log(`Context built:`);
    console.log(`  - Contact: ${context.contact?.name || 'New'}`);
    console.log(`  - Customer: ${context.customer?.name || 'Unknown'}`);
    console.log(`  - Locations: ${context.locations.length}`);
    console.log(`  - Past communications: ${context.communications.length}`);
    console.log(`  - Past orders: ${context.orders.length}`);

    return context;
  }

  /**
   * Log the communication to Airtable
   */
  async logCommunication(email, context, analysis) {
    return await airtable.logCommunication({
      date: email.receivedAt || new Date().toISOString(),
      direction: 'inbound',
      channel: 'email',
      from: email.from,
      subject: email.subject,
      body: email.bodyPreview || email.body?.substring(0, 5000),  // Truncate if needed
      contactId: context.contact?.id,
      customerId: context.customer?.id,
      aiSummary: analysis.summary,
      aiExtractedData: analysis.extractedData,
      parsed: true
    });
  }

  /**
   * Route to the appropriate handler based on intent
   */
  async routeToHandler(email, context, analysis, commId) {
    const intent = analysis.intent;
    const handlerName = config.intents[intent]?.handler || 'unknownHandler';

    console.log(`Routing to handler: ${handlerName}`);

    switch (handlerName) {
      case 'orderHandler':
        return await orderHandler.handle(email, context, analysis, commId);

      case 'orderFollowupHandler':
        return await orderHandler.handleFollowup(email, context, analysis, commId);

      case 'invoiceHandler':
        return await invoiceHandler.handle(email, context, analysis, commId);

      case 'vendorResponseHandler':
        return await orderHandler.handleVendorResponse(email, context, analysis, commId);

      case 'pricingHandler':
      case 'questionHandler':
      case 'schedulingHandler':
      case 'complaintHandler':
      case 'internalHandler':
      case 'unknownHandler':
      default:
        return await generalHandler.handle(email, context, analysis, commId);
    }
  }

  /**
   * Process a batch of emails (useful for testing or backfill)
   */
  async processBatch(emailIds) {
    const results = [];

    for (const emailId of emailIds) {
      const result = await this.processIncomingEmail(emailId);
      results.push(result);

      // Small delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

module.exports = new EmailProcessor();
