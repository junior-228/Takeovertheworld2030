/**
 * AGENT CONFIGURATION
 * This is the "brain" of the email agent - edit this to teach it new skills
 */

module.exports = {
  // Agent identity
  identity: {
    name: "Pallet Solutions AI Assistant",
    company: "Pallet Solutions USA",
    role: "Operations Email Handler"
  },

  // Intent classification - the agent will classify every email into one of these
  intents: {
    ORDER: {
      description: "Customer wants to place an order for pallets",
      keywords: ["order", "need", "deliver", "pallets", "shipment", "quantity", "load", "truck"],
      priority: "high",
      handler: "orderHandler",
      requiresHumanApproval: false
    },
    ORDER_FOLLOWUP: {
      description: "Follow-up on an existing order",
      keywords: ["status", "where is", "tracking", "ETA", "when will", "update on order"],
      priority: "medium",
      handler: "orderFollowupHandler",
      requiresHumanApproval: false
    },
    INVOICE_ISSUE: {
      description: "Problem with an invoice - dispute, question, or discrepancy",
      keywords: ["invoice", "bill", "charge", "payment", "doesn't match", "incorrect", "overcharged"],
      priority: "high",
      handler: "invoiceHandler",
      requiresHumanApproval: true
    },
    PRICING_REQUEST: {
      description: "Asking for pricing or quotes",
      keywords: ["price", "quote", "cost", "rate", "how much"],
      priority: "medium",
      handler: "pricingHandler",
      requiresHumanApproval: false
    },
    COMPLAINT: {
      description: "Customer complaint about quality, service, or delivery",
      keywords: ["complaint", "damaged", "wrong", "late", "problem", "issue", "unhappy", "disappointed"],
      priority: "high",
      handler: "complaintHandler",
      requiresHumanApproval: true
    },
    SCHEDULING: {
      description: "Scheduling deliveries, pickups, or meetings",
      keywords: ["schedule", "reschedule", "appointment", "pickup", "delivery time", "available"],
      priority: "medium",
      handler: "schedulingHandler",
      requiresHumanApproval: false
    },
    QUESTION: {
      description: "General question about products, services, or company",
      keywords: ["question", "do you", "can you", "what is", "how do", "information"],
      priority: "low",
      handler: "questionHandler",
      requiresHumanApproval: false
    },
    VENDOR_RESPONSE: {
      description: "Response from a vendor (confirmation, rejection, etc)",
      keywords: ["confirm", "yes", "no", "accept", "reject", "approved", "denied"],
      priority: "high",
      handler: "vendorResponseHandler",
      requiresHumanApproval: false
    },
    INTERNAL: {
      description: "Internal team communication",
      keywords: [],  // Detected by sender domain
      priority: "medium",
      handler: "internalHandler",
      requiresHumanApproval: false
    },
    UNKNOWN: {
      description: "Cannot determine intent - needs human review",
      keywords: [],
      priority: "low",
      handler: "unknownHandler",
      requiresHumanApproval: true
    }
  },

  // Airtable table mappings
  tables: {
    customers: "Customer",
    contacts: "Contact",
    locations: "Locations",
    vendors: "Vendors",
    locationRequirements: "LOCATION REQUIREMENTS",
    products: "PRODUCTS",
    orders: "ORDERS",
    communications: "COMMUNICATIONS",
    pricing: "PRICING"
  },

  // How much context to pull
  contextLimits: {
    maxCommunications: 10,    // Last N communications with this contact
    maxOrders: 5,             // Last N orders from this customer
    maxInvoices: 5,           // Last N invoices for this customer
    contextWindowDays: 90     // Only look back this many days
  },

  // Response settings
  responses: {
    autoReply: true,                    // Should agent auto-reply to emails?
    draftForReview: true,               // Create drafts for human review instead of sending?
    ccOperations: "operations@palletsolutionsusa.com",
    signatureTemplate: `
Best regards,
Pallet Solutions USA
Operations Team

---
This message was processed by our AI assistant.
If you need immediate human assistance, please reply with "HUMAN" in the subject line.
`
  },

  // Internal domain detection
  internalDomains: [
    "palletsolutionsusa.com"
  ],

  // Vendor domain patterns (to identify vendor responses)
  vendorDomainPatterns: [
    // Add vendor email domains here as you onboard them
  ]
};
