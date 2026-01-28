# PS Email Agent Setup Guide

This guide will get your AI email agent running and processing emails automatically.

## Prerequisites

- Node.js 18+ installed
- Anthropic API key (Claude)
- Airtable account with base already set up
- Microsoft 365 admin access (for Azure AD app registration)

## Step 1: Install Dependencies

```bash
cd ps-email-agent
npm install
```

## Step 2: Configure Environment

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Fill in your `.env` file:

### Anthropic API Key
Get from: https://console.anthropic.com/
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Airtable API Key
Get from: https://airtable.com/create/tokens
- Create a Personal Access Token
- Grant access to your "Pallet Solutions Operations" base
- Permissions needed: `data.records:read`, `data.records:write`
```
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=appQYT3aaMX1SzO7M
```

### Microsoft 365 Setup (More Complex)

You need to register an app in Azure AD:

1. Go to https://portal.azure.com
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
   - Name: "PS Email Agent"
   - Supported account types: "Single tenant"
   - Redirect URI: Leave blank for now
4. After creation, note down:
   - Application (client) ID → `MICROSOFT_CLIENT_ID`
   - Directory (tenant) ID → `MICROSOFT_TENANT_ID`
5. Go to **Certificates & secrets** → **New client secret**
   - Note down the secret value → `MICROSOFT_CLIENT_SECRET`
6. Go to **API permissions** → **Add a permission**
   - Microsoft Graph → Application permissions
   - Add: `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`
7. Click **Grant admin consent** for your organization

```
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-secret
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_USER_EMAIL=operations@palletsolutionsusa.com
```

### Server Config
```
PORT=3000
WEBHOOK_SECRET=generate-a-random-string-here
BASE_URL=https://your-deployed-url.com
```

## Step 3: Test Locally

Run the test suite to verify AI is working:
```bash
npm test
```

This runs sample emails through the AI without actually sending anything.

## Step 4: Deploy

### Option A: Railway (Recommended - Easy)

1. Push code to GitHub
2. Go to https://railway.app
3. New Project → Deploy from GitHub
4. Add environment variables
5. Railway gives you a public URL

### Option B: Render

1. Go to https://render.com
2. New → Web Service → Connect GitHub
3. Add environment variables
4. Render gives you a public URL

### Option C: Your Own Server

```bash
npm start
```
Use nginx/Apache as reverse proxy with SSL.

## Step 5: Set Up Email Webhook

Once deployed with a public HTTPS URL:

1. Start your server
2. Call the subscription endpoint:
```bash
curl -X POST https://your-url.com/subscription/create \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://your-url.com/webhook/email"}'
```

3. Microsoft will validate the webhook and start sending notifications

**Important:** Subscriptions expire after ~3 days. Set up a cron job to renew:
```bash
# Run daily
curl -X POST https://your-url.com/subscription/renew/SUBSCRIPTION_ID
```

## Step 6: Verify It Works

1. Send a test email to your monitored inbox
2. Check server logs - you should see:
   - "Received 1 notification(s)"
   - "Processing email: ..."
   - Intent classification
   - Action taken
3. Check Airtable COMMUNICATIONS table - new record should appear

## Testing Endpoints

- **Health check:** `GET /health`
- **Process specific email:** `POST /process/:emailId`
- **Process recent emails:** `POST /process-recent?count=5`
- **List subscriptions:** `GET /subscription/list`

## Customization

### Add New Intent Types

Edit `src/config/agent-config.js`:
```javascript
intents: {
  // Add new intent
  RETURN_REQUEST: {
    description: "Customer wants to return pallets",
    keywords: ["return", "send back", "pickup empties"],
    priority: "medium",
    handler: "returnHandler",
    requiresHumanApproval: false
  }
}
```

Then create the handler in `src/handlers/`.

### Change Auto-Reply Behavior

In `agent-config.js`:
```javascript
responses: {
  autoReply: false,        // Don't auto-send
  draftForReview: true,    // Create drafts instead
}
```

### Add Vendor Domains

```javascript
vendorDomainPatterns: [
  "vendorcompany.com",
  "another-vendor.com"
]
```

## Troubleshooting

### "No contact found"
- Check the email in Airtable Contact table
- Verify email field matches exactly

### "Webhook validation failed"
- Ensure WEBHOOK_SECRET matches between env and Microsoft subscription
- Check URL is accessible from internet

### "Authentication error"
- Verify Azure AD app permissions
- Ensure admin consent was granted
- Check client secret hasn't expired

## Architecture

```
Email arrives
     ↓
Microsoft 365 webhook fires
     ↓
/webhook/email endpoint receives notification
     ↓
email-processor.js orchestrates:
  1. Fetch email content from Graph API
  2. Build context from Airtable (contact, history, orders)
  3. Send to Claude for analysis
  4. Route to appropriate handler
  5. Execute action (create order, draft response, flag for human)
  6. Log EVERYTHING to COMMUNICATIONS table
     ↓
Next email from same person has full context
```

## Support

If you run into issues, the logs will show exactly where things failed. The system is designed to fail gracefully - if AI parsing fails, it logs the error and flags for human review rather than crashing.
