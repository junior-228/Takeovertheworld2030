/**
 * ORDER HANDLER
 * Handles order-related emails: new orders, follow-ups, vendor responses
 */

const airtable = require('../services/airtable');
const emailService = require('../services/email');
const aiAgent = require('../services/ai-agent');
const config = require('../config/agent-config');

class OrderHandler {
  /**
   * Handle a new order request
   */
  async handle(email, context, analysis, commId) {
    console.log('OrderHandler: Processing new order request');

    const extracted = analysis.extractedData;

    // Check if we have enough info to create an order
    const missingFields = this.validateOrderData(extracted, context);

    if (missingFields.length > 0) {
      // Need more information - draft a response asking for it
      console.log(`Missing fields: ${missingFields.join(', ')}`);

      const clarificationResponse = await this.generateClarificationRequest(
        email,
        context,
        missingFields,
        analysis
      );

      return {
        status: 'pending_clarification',
        action: 'DRAFT_RESPONSE',
        missingFields,
        draftResponse: clarificationResponse
      };
    }

    // We have enough info - create the order
    try {
      // Determine location
      let locationId = null;
      if (extracted.locationMentioned && context.locations.length > 0) {
        // Try to match mentioned location
        const matchedLocation = context.locations.find(loc =>
          loc.name.toLowerCase().includes(extracted.locationMentioned.toLowerCase()) ||
          loc.city?.toLowerCase().includes(extracted.locationMentioned.toLowerCase())
        );
        locationId = matchedLocation?.id;
      } else if (context.locations.length === 1) {
        // Only one location - use it
        locationId = context.locations[0].id;
      }

      // Get vendor for the location
      let vendorId = null;
      if (locationId) {
        const vendor = await airtable.getVendorForLocation(locationId);
        vendorId = vendor?.id;
      }

      // Create the order
      const order = await airtable.createOrder({
        customerId: context.customer?.id,
        contactId: context.contact?.id,
        locationId,
        vendorId,
        product: extracted.product || 'Pallets',
        grade: extracted.grade,
        quantity: extracted.quantity,
        requestedDate: extracted.requestedDate,
        customerPO: extracted.poNumber,
        notes: `Source: Email from ${email.from}\nSummary: ${analysis.summary}`
      });

      console.log(`Order created: ${order.orderId || order.id}`);

      // Update the communication record with the order link
      await airtable.base(config.tables.communications).update(commId, {
        'Related Order': [order.id]
      });

      // If we have vendor info, send them a confirmation request
      if (vendorId) {
        await this.sendVendorConfirmationRequest(order, context);
      }

      return {
        status: 'order_created',
        action: 'CREATE_ORDER',
        orderId: order.id,
        orderNumber: order.orderId
      };

    } catch (error) {
      console.error('Error creating order:', error);
      return {
        status: 'error',
        action: 'FLAG_FOR_HUMAN',
        error: error.message
      };
    }
  }

  /**
   * Handle order follow-up requests (status check, ETA, etc.)
   */
  async handleFollowup(email, context, analysis, commId) {
    console.log('OrderHandler: Processing order follow-up');

    // Try to find the referenced order
    let order = null;
    const extracted = analysis.extractedData;

    if (extracted.referencedOrderId) {
      // They mentioned a specific order number
      const orders = await airtable.base(config.tables.orders)
        .select({
          filterByFormula: `OR({Order ID} = "${extracted.referencedOrderId}", RECORD_ID() = "${extracted.referencedOrderId}")`,
          maxRecords: 1
        })
        .firstPage();

      if (orders.length > 0) {
        order = orders[0];
      }
    } else if (context.orders.length > 0) {
      // Use most recent order
      order = context.orders[0];
    }

    if (order) {
      return {
        status: 'followup_processed',
        action: 'DRAFT_RESPONSE',
        orderId: order.id,
        orderStatus: order.status || order.fields?.Status,
        draftResponse: analysis.draftResponse
      };
    } else {
      return {
        status: 'no_order_found',
        action: 'DRAFT_RESPONSE',
        draftResponse: analysis.draftResponse
      };
    }
  }

  /**
   * Handle vendor response (confirmation or rejection)
   */
  async handleVendorResponse(email, context, analysis, commId) {
    console.log('OrderHandler: Processing vendor response');

    // This would typically be triggered by YES/NO button clicks
    // For email responses, we need to parse the intent

    const isConfirmation = analysis.extractedData.isConfirmation ??
      /\b(yes|confirm|accept|approved|can do|will do)\b/i.test(email.bodyPreview);

    // Find the related order (would need to be linked somehow)
    // For now, log it for human review

    return {
      status: 'vendor_response_logged',
      action: 'FLAG_FOR_HUMAN',
      isConfirmation,
      notes: 'Vendor response needs to be linked to order manually'
    };
  }

  /**
   * Validate we have enough data to create an order
   */
  validateOrderData(extracted, context) {
    const missing = [];

    // Must have quantity
    if (!extracted.quantity) {
      missing.push('quantity');
    }

    // Must have a way to determine location
    if (!extracted.locationMentioned && context.locations.length !== 1) {
      if (context.locations.length === 0) {
        missing.push('delivery location (no locations on file)');
      } else {
        missing.push('delivery location (multiple on file, please specify)');
      }
    }

    // Product is nice to have but we can default
    // Date is nice to have but can ask

    return missing;
  }

  /**
   * Generate a response asking for missing information
   */
  async generateClarificationRequest(email, context, missingFields, analysis) {
    const prompt = `Generate a brief, friendly email asking the customer for the missing information.

Customer: ${context.contact?.name || 'Customer'}
Their request: ${analysis.summary}
Missing information: ${missingFields.join(', ')}

${context.locations.length > 1 ? `Available locations on file: ${context.locations.map(l => l.name).join(', ')}` : ''}

Be concise and professional. Ask for all missing info in one email.`;

    return await aiAgent.generateResponse('clarification request', { email, analysis }, prompt);
  }

  /**
   * Send confirmation request to vendor
   */
  async sendVendorConfirmationRequest(order, context) {
    // Get vendor details
    const vendor = await airtable.getVendorForLocation(order.locationId);
    if (!vendor?.email) {
      console.log('No vendor email - skipping vendor notification');
      return;
    }

    const customerName = context.customer?.name || 'Customer';
    const location = context.locations.find(l => l.id === order.locationId);

    const subject = `Order Confirmation Request - ${customerName} - ${order.quantity} ${order.product || 'pallets'}`;

    const body = `Hello ${vendor.contactName || vendor.name},

We have a new order that needs your confirmation:

Customer: ${customerName}
Product: ${order.product || 'Pallets'} ${order.grade || ''}
Quantity: ${order.quantity}
Delivery Location: ${location?.name || 'TBD'}
${location?.address ? `Address: ${location.address}, ${location.city}, ${location.state} ${location.zip}` : ''}
Requested Date: ${order.requestedDate || 'ASAP'}

Can you fulfill this order?

Please reply YES to confirm or NO if unavailable.

Thank you,
Pallet Solutions USA Operations`;

    try {
      await emailService.sendEmail(vendor.email, subject, body, {
        cc: config.responses.ccOperations
      });
      console.log(`Vendor confirmation request sent to ${vendor.email}`);
    } catch (error) {
      console.error('Failed to send vendor email:', error);
    }
  }
}

module.exports = new OrderHandler();
