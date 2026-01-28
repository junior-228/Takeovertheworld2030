/**
 * PS EMAIL AGENT
 * Main server entry point
 *
 * Handles:
 * - Microsoft 365 webhook for incoming emails
 * - Health checks
 * - Manual processing endpoints
 */

require('dotenv').config();
const express = require('express');
const emailService = require('./services/email');
const emailProcessor = require('./services/email-processor');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ============================================
// WEBHOOK ENDPOINT FOR MICROSOFT 365
// ============================================

/**
 * Microsoft Graph sends a validation request first
 * Then sends notifications when new emails arrive
 */
app.post('/webhook/email', async (req, res) => {
  // Handle validation request from Microsoft
  if (req.query.validationToken) {
    console.log('Webhook validation request received');
    return res.status(200).send(req.query.validationToken);
  }

  // Verify the client state (security)
  const clientState = req.body.value?.[0]?.clientState;
  if (clientState && clientState !== process.env.WEBHOOK_SECRET) {
    console.error('Invalid client state - possible spoofed request');
    return res.status(401).send('Invalid client state');
  }

  // Process the notification
  try {
    const notifications = req.body.value || [];
    console.log(`Received ${notifications.length} notification(s)`);

    // Respond immediately (Microsoft requires response within 3 seconds)
    res.status(202).send('Accepted');

    // Process each notification asynchronously
    for (const notification of notifications) {
      if (notification.resourceData?.id) {
        // Process in background (don't await)
        emailProcessor.processIncomingEmail(notification.resourceData.id)
          .catch(err => console.error('Background processing error:', err));
      }
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// ============================================
// MANUAL PROCESSING ENDPOINTS
// ============================================

/**
 * Manually process a specific email by ID
 */
app.post('/process/:emailId', async (req, res) => {
  const { emailId } = req.params;

  try {
    const result = await emailProcessor.processIncomingEmail(emailId);
    res.json(result);
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Process recent unread emails (useful for testing)
 */
app.post('/process-recent', async (req, res) => {
  const count = parseInt(req.query.count) || 5;

  try {
    const emails = await emailService.getRecentEmails(count);
    const results = [];

    for (const email of emails) {
      const result = await emailProcessor.processIncomingEmail(email.id);
      results.push(result);
    }

    res.json({ processed: results.length, results });
  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Create or renew the webhook subscription
 */
app.post('/subscription/create', async (req, res) => {
  try {
    const webhookUrl = req.body.webhookUrl || `${process.env.BASE_URL}/webhook/email`;
    const result = await emailService.createWebhookSubscription(webhookUrl);
    res.json(result);
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List active subscriptions
 */
app.get('/subscription/list', async (req, res) => {
  try {
    const subscriptions = await emailService.listSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    console.error('List subscriptions error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Renew a subscription
 */
app.post('/subscription/renew/:id', async (req, res) => {
  try {
    const result = await emailService.renewSubscription(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HEALTH & INFO
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PS Email Agent',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Pallet Solutions Email Agent',
    version: '1.0.0',
    endpoints: {
      webhook: 'POST /webhook/email',
      processEmail: 'POST /process/:emailId',
      processRecent: 'POST /process-recent?count=5',
      createSubscription: 'POST /subscription/create',
      listSubscriptions: 'GET /subscription/list',
      renewSubscription: 'POST /subscription/renew/:id',
      health: 'GET /health'
    }
  });
});

// ============================================
// STARTUP
// ============================================

async function start() {
  try {
    // Initialize email service
    await emailService.initialize();
    console.log('Email service initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log('  PS Email Agent Server Started');
      console.log(`${'='.repeat(50)}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Webhook URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}/webhook/email`);
      console.log(`${'='.repeat(50)}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
