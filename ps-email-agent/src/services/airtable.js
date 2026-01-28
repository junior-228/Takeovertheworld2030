/**
 * AIRTABLE SERVICE
 * Handles all database operations - contacts, communications, orders, etc.
 */

const Airtable = require('airtable');
const config = require('../config/agent-config');

class AirtableService {
  constructor() {
    this.base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);
  }

  // ============================================
  // CONTACT & CUSTOMER LOOKUPS
  // ============================================

  /**
   * Find a contact by email address
   */
  async findContactByEmail(email) {
    try {
      const records = await this.base(config.tables.contacts)
        .select({
          filterByFormula: `LOWER({Email}) = LOWER("${email}")`,
          maxRecords: 1
        })
        .firstPage();

      if (records.length === 0) return null;

      const contact = records[0];
      return {
        id: contact.id,
        name: contact.get('Name'),
        email: contact.get('Email'),
        phone: contact.get('Phone'),
        customerId: contact.get('Customer')?.[0],  // Linked record
        locationIds: contact.get('Locations') || [],
        role: contact.get('Role'),
        notes: contact.get('Notes')
      };
    } catch (error) {
      console.error('Error finding contact:', error);
      return null;
    }
  }

  /**
   * Get full customer details including all related data
   */
  async getCustomerContext(customerId) {
    if (!customerId) return null;

    try {
      const record = await this.base(config.tables.customers).find(customerId);

      return {
        id: record.id,
        name: record.get('Name'),
        code: record.get('Customer Code'),
        contactIds: record.get('Contacts') || [],
        locationIds: record.get('Locations') || [],
        orderIds: record.get('Orders') || [],
        notes: record.get('Notes'),
        status: record.get('Status')
      };
    } catch (error) {
      console.error('Error getting customer:', error);
      return null;
    }
  }

  /**
   * Get location details
   */
  async getLocation(locationId) {
    if (!locationId) return null;

    try {
      const record = await this.base(config.tables.locations).find(locationId);

      return {
        id: record.id,
        name: record.get('Name'),
        address: record.get('Address'),
        city: record.get('City'),
        state: record.get('State'),
        zip: record.get('Zip'),
        vendorId: record.get('Preferred Vendor')?.[0],
        requirements: record.get('Requirements'),
        notes: record.get('Notes')
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // ============================================
  // COMMUNICATION HISTORY
  // ============================================

  /**
   * Get recent communications for a contact
   * This is the KEY to context - the agent reads past conversations
   */
  async getRecentCommunications(contactId, limit = config.contextLimits.maxCommunications) {
    if (!contactId) return [];

    try {
      const records = await this.base(config.tables.communications)
        .select({
          filterByFormula: `FIND("${contactId}", ARRAYJOIN({Contact})) > 0`,
          sort: [{ field: 'Date', direction: 'desc' }],
          maxRecords: limit
        })
        .firstPage();

      return records.map(record => ({
        id: record.id,
        date: record.get('Date'),
        direction: record.get('Direction'),  // inbound/outbound
        channel: record.get('Channel'),      // email/phone/etc
        subject: record.get('Subject'),
        body: record.get('Body'),
        aiSummary: record.get('AI Summary'),
        aiExtractedData: record.get('AI Extracted Data'),
        relatedOrderId: record.get('Related Order')?.[0],
        parsed: record.get('Parsed')
      }));
    } catch (error) {
      console.error('Error getting communications:', error);
      return [];
    }
  }

  /**
   * Log a new communication - EVERY email gets logged
   */
  async logCommunication(data) {
    try {
      const record = await this.base(config.tables.communications).create({
        'Date': data.date || new Date().toISOString(),
        'Direction': data.direction || 'inbound',
        'Channel': data.channel || 'email',
        'From': data.from,
        'Subject': data.subject,
        'Body': data.body,
        'Contact': data.contactId ? [data.contactId] : [],
        'Customer': data.customerId ? [data.customerId] : [],
        'Related Order': data.orderId ? [data.orderId] : [],
        'AI Summary': data.aiSummary,
        'AI Extracted Data': data.aiExtractedData ? JSON.stringify(data.aiExtractedData) : '',
        'Location': data.locationId ? [data.locationId] : [],
        'Parsed': data.parsed || false
      });

      return record.id;
    } catch (error) {
      console.error('Error logging communication:', error);
      throw error;
    }
  }

  // ============================================
  // ORDER OPERATIONS
  // ============================================

  /**
   * Get recent orders for a customer
   */
  async getRecentOrders(customerId, limit = config.contextLimits.maxOrders) {
    if (!customerId) return [];

    try {
      const records = await this.base(config.tables.orders)
        .select({
          filterByFormula: `FIND("${customerId}", ARRAYJOIN({Customer})) > 0`,
          sort: [{ field: 'Created', direction: 'desc' }],
          maxRecords: limit
        })
        .firstPage();

      return records.map(record => ({
        id: record.id,
        orderId: record.get('Order ID'),
        status: record.get('Status'),
        product: record.get('Product'),
        grade: record.get('Grade'),
        quantity: record.get('Volume'),
        unit: record.get('Unit'),
        requestedDate: record.get('Requested Date'),
        deliveryDate: record.get('Delivery Date'),
        locationId: record.get('Location')?.[0],
        vendorId: record.get('Vendor')?.[0],
        customerPO: record.get('Customer PO'),
        notes: record.get('Notes'),
        created: record.get('Created')
      }));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  /**
   * Create a new order
   */
  async createOrder(data) {
    try {
      const record = await this.base(config.tables.orders).create({
        'Customer': data.customerId ? [data.customerId] : [],
        'Contact': data.contactId ? [data.contactId] : [],
        'Location': data.locationId ? [data.locationId] : [],
        'Vendor': data.vendorId ? [data.vendorId] : [],
        'Product': data.product,
        'Grade': data.grade,
        'Volume': data.quantity,
        'Unit': data.unit || 'pallets',
        'Requested Date': data.requestedDate,
        'Status': 'Pending',
        'Customer PO': data.customerPO,
        'Notes': data.notes,
        'Source': 'AI Email Agent'
      });

      return {
        id: record.id,
        orderId: record.get('Order ID')
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update an order
   */
  async updateOrder(orderId, data) {
    try {
      const record = await this.base(config.tables.orders).update(orderId, data);
      return record;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // ============================================
  // VENDOR OPERATIONS
  // ============================================

  /**
   * Get vendor for a location
   */
  async getVendorForLocation(locationId) {
    const location = await this.getLocation(locationId);
    if (!location?.vendorId) return null;

    try {
      const record = await this.base(config.tables.vendors).find(location.vendorId);

      return {
        id: record.id,
        name: record.get('Name'),
        email: record.get('Email'),
        phone: record.get('Phone'),
        contactName: record.get('Contact Name'),
        notes: record.get('Notes')
      };
    } catch (error) {
      console.error('Error getting vendor:', error);
      return null;
    }
  }

  // ============================================
  // PRICING
  // ============================================

  /**
   * Get pricing for a customer/location/product combination
   */
  async getPricing(customerId, locationId, product) {
    try {
      let formula = '1=1';  // Base formula

      if (customerId) {
        formula = `AND(${formula}, FIND("${customerId}", ARRAYJOIN({Customer})) > 0)`;
      }
      if (locationId) {
        formula = `AND(${formula}, FIND("${locationId}", ARRAYJOIN({Location})) > 0)`;
      }
      if (product) {
        formula = `AND(${formula}, FIND("${product}", {Product}) > 0)`;
      }

      const records = await this.base(config.tables.pricing)
        .select({
          filterByFormula: formula,
          maxRecords: 10
        })
        .firstPage();

      return records.map(record => ({
        id: record.id,
        product: record.get('Product'),
        grade: record.get('Grade'),
        price: record.get('Price'),
        unit: record.get('Unit'),
        effectiveDate: record.get('Effective Date'),
        notes: record.get('Notes')
      }));
    } catch (error) {
      console.error('Error getting pricing:', error);
      return [];
    }
  }

  // ============================================
  // CONTACT CREATION (for new senders)
  // ============================================

  /**
   * Create a new contact when we receive email from unknown sender
   */
  async createContact(data) {
    try {
      const record = await this.base(config.tables.contacts).create({
        'Name': data.name || data.email.split('@')[0],
        'Email': data.email,
        'Source': 'AI Email Agent - Auto-created',
        'Notes': `Automatically created from inbound email on ${new Date().toISOString()}`
      });

      return {
        id: record.id,
        name: record.get('Name'),
        email: record.get('Email')
      };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }
}

module.exports = new AirtableService();
