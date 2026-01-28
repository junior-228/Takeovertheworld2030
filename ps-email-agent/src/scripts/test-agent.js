/**
 * TEST SCRIPT
 * Test the AI agent with sample emails without actually sending/receiving
 */

const dotenvResult = require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
if (dotenvResult.parsed) Object.assign(process.env, dotenvResult.parsed);
console.log('ENV loaded:', Object.keys(dotenvResult.parsed || {}).length, 'keys');
console.log('API Key found:', !!process.env.ANTHROPIC_API_KEY);
const aiAgent = require('../services/ai-agent');
const airtable = require('../services/airtable');

// Sample test emails
const testEmails = [
  {
    name: 'Simple Order',
    email: {
      id: 'test-001',
      from: 'customer@example.com',
      fromName: 'John Smith',
      subject: 'Need pallets for next week',
      body: 'Hi, we need 200 Grade A pallets delivered to our warehouse next Tuesday. Thanks!',
      bodyPreview: 'Hi, we need 200 Grade A pallets delivered to our warehouse next Tuesday. Thanks!',
      receivedAt: new Date().toISOString()
    }
  },
  {
    name: 'Vague Order (needs context)',
    email: {
      id: 'test-002',
      from: 'customer@example.com',
      fromName: 'John Smith',
      subject: 'Re: Pallets',
      body: 'Same as last time please, but for Friday.',
      bodyPreview: 'Same as last time please, but for Friday.',
      receivedAt: new Date().toISOString()
    }
  },
  {
    name: 'Invoice Dispute',
    email: {
      id: 'test-003',
      from: 'accounting@company.com',
      fromName: 'Jane Doe',
      subject: 'Invoice #12345 discrepancy',
      body: 'The invoice shows 500 pallets but we only received 450. Please adjust.',
      bodyPreview: 'The invoice shows 500 pallets but we only received 450. Please adjust.',
      receivedAt: new Date().toISOString()
    }
  },
  {
    name: 'Order Status Check',
    email: {
      id: 'test-004',
      from: 'customer@example.com',
      fromName: 'John Smith',
      subject: 'Order update?',
      body: 'Hey, any update on my order from yesterday? When will it arrive?',
      bodyPreview: 'Hey, any update on my order from yesterday? When will it arrive?',
      receivedAt: new Date().toISOString()
    }
  },
  {
    name: 'Pricing Request',
    email: {
      id: 'test-005',
      from: 'newcustomer@business.com',
      fromName: 'Mike Johnson',
      subject: 'Pricing inquiry',
      body: 'Hi, we\'re looking for a pallet supplier. Can you send me your pricing for Grade A and Grade B 48x40 pallets? We typically need 500-1000 per month.',
      bodyPreview: 'Hi, we\'re looking for a pallet supplier. Can you send me your pricing...',
      receivedAt: new Date().toISOString()
    }
  },
  {
    name: 'Complaint',
    email: {
      id: 'test-006',
      from: 'customer@example.com',
      fromName: 'John Smith',
      subject: 'Damaged pallets',
      body: 'The last delivery had 50 damaged pallets. This is unacceptable. We need replacements ASAP or a credit.',
      bodyPreview: 'The last delivery had 50 damaged pallets. This is unacceptable...',
      receivedAt: new Date().toISOString()
    }
  }
];

// Mock context with history (simulates what would come from Airtable)
const mockContext = {
  contact: {
    id: 'rec123',
    name: 'John Smith',
    email: 'customer@example.com',
    role: 'Procurement Manager'
  },
  customer: {
    id: 'cust456',
    name: 'ABC Manufacturing',
    code: 'ABC-001',
    status: 'Active'
  },
  locations: [
    {
      id: 'loc789',
      name: 'Main Warehouse',
      address: '123 Industrial Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601'
    }
  ],
  communications: [
    {
      date: '2025-01-15',
      direction: 'inbound',
      subject: 'Order request',
      body: 'Need 150 Grade A 48x40 pallets for next Monday',
      aiSummary: 'Customer ordered 150 Grade A pallets for Monday delivery'
    },
    {
      date: '2025-01-10',
      direction: 'outbound',
      subject: 'Re: Delivery confirmed',
      body: 'Your order of 200 pallets has been delivered',
      aiSummary: 'Confirmed delivery of 200 pallets'
    }
  ],
  orders: [
    {
      orderId: 'ORD-2025-001',
      product: 'Grade A 48x40',
      quantity: 150,
      status: 'Pending',
      requestedDate: '2025-01-20',
      created: '2025-01-15'
    },
    {
      orderId: 'ORD-2025-000',
      product: 'Grade A 48x40',
      quantity: 200,
      status: 'Delivered',
      requestedDate: '2025-01-10',
      created: '2025-01-08'
    }
  ],
  pricing: [
    { product: 'Grade A 48x40', price: 8.50, unit: 'pallet' },
    { product: 'Grade B 48x40', price: 5.00, unit: 'pallet' }
  ]
};

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('  PS EMAIL AGENT - TEST SUITE');
  console.log('='.repeat(70) + '\n');

  for (const test of testEmails) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`TEST: ${test.name}`);
    console.log(`${'─'.repeat(70)}`);
    console.log(`Email: "${test.email.subject}"`);
    console.log(`Body: ${test.email.bodyPreview}`);
    console.log(`${'─'.repeat(70)}`);

    try {
      const result = await aiAgent.processEmail(test.email, mockContext);

      console.log('\nRESULT:');
      console.log(`  Intent: ${result.intent} (confidence: ${result.confidence})`);
      console.log(`  Summary: ${result.summary}`);
      console.log(`  Action: ${result.suggestedAction?.type}`);
      console.log(`  Requires Human: ${result.requiresHumanReview}`);

      if (result.extractedData && Object.keys(result.extractedData).length > 0) {
        console.log('  Extracted Data:');
        Object.entries(result.extractedData).forEach(([key, value]) => {
          if (value !== null) {
            console.log(`    - ${key}: ${value}`);
          }
        });
      }

      if (result.draftResponse) {
        console.log('\n  Draft Response:');
        console.log('  ' + '─'.repeat(40));
        console.log('  ' + result.draftResponse.split('\n').join('\n  '));
        console.log('  ' + '─'.repeat(40));
      }

      console.log(`\n  Reasoning: ${result.reasoning}`);

    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('  TEST SUITE COMPLETE');
  console.log('='.repeat(70) + '\n');
}

// Test with real Airtable data
async function testWithRealData(email) {
  console.log('\nTesting with real Airtable data...\n');

  // Try to find contact
  const contact = await airtable.findContactByEmail(email);

  if (!contact) {
    console.log(`No contact found for: ${email}`);
    return;
  }

  console.log(`Found contact: ${contact.name}`);

  // Get full context
  const context = {
    contact,
    customer: contact.customerId ? await airtable.getCustomerContext(contact.customerId) : null,
    locations: [],
    communications: await airtable.getRecentCommunications(contact.id),
    orders: [],
    pricing: []
  };

  if (context.customer) {
    context.orders = await airtable.getRecentOrders(context.customer.id);
    context.pricing = await airtable.getPricing(context.customer.id);
  }

  console.log('\nContext loaded:');
  console.log(`  - Communications: ${context.communications.length}`);
  console.log(`  - Orders: ${context.orders.length}`);
  console.log(`  - Pricing records: ${context.pricing.length}`);

  // Show recent communications
  if (context.communications.length > 0) {
    console.log('\nRecent communications:');
    context.communications.slice(0, 3).forEach((comm, i) => {
      console.log(`  ${i + 1}. [${comm.date}] ${comm.subject || 'No subject'}`);
    });
  }
}

// Run based on command line args
const args = process.argv.slice(2);

if (args[0] === '--real' && args[1]) {
  testWithRealData(args[1]).catch(console.error);
} else {
  runTests().catch(console.error);
}
