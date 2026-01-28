# Session Summary - January 28, 2026

## What We Worked On
Built a **code-based AI Email Agent** for Pallet Solutions USA that automatically processes incoming customer emails, classifies intent, extracts data, and routes actions appropriately.

This replaced the original Make.com approach because:
- Code is harder to replicate (competitive advantage)
- Logic lives in one place (easier to train/improve)
- Better version control
- The AI "brain" can learn from every conversation

## Decisions Made
- **Code over Make.com**: Visual workflows are harder to maintain and train; code-based approach is more powerful
- **Railway for hosting**: ~$5/month, easy GitHub deploy, reliable for always-on servers
- **Airtable as database**: Existing structure works perfectly (Contact, COMMUNICATIONS, ORDERS tables)
- **Claude API for AI**: Using claude-sonnet-4-20250514 for email classification
- **Microsoft 365 for email**: Will use Graph API with webhook subscription (pending setup)

## Current State
**Working:**
- Complete Node.js email agent codebase
- AI classification tested with 6 email types - all working
- Successfully handles vague requests like "same as last time" using context
- Airtable integration configured
- Anthropic API integration configured

**Test Results:**
| Email Type | Classification | Confidence |
|------------|---------------|------------|
| Simple Order | ORDER | 95% |
| Vague Order ("same as last time") | ORDER | 85% |
| Invoice Dispute | INVOICE_ISSUE | 95% |
| Order Status Check | ORDER_FOLLOWUP | 95% |
| Pricing Request | PRICING_REQUEST | 95% |
| Complaint | COMPLAINT | 95% |

## Open Loops
- [ ] **Microsoft 365 / Azure AD setup** - Need partner's access to Azure Portal to register app and get credentials
- [ ] **Deploy to Railway** - Push to GitHub, connect Railway, add env variables
- [ ] **Configure email webhook** - Tell Microsoft to notify the agent when emails arrive
- [ ] **Pallet Connect webhooks** - Discussed potential uses, needs exploration of what events are available
- [ ] **Build API costs into pricing skill** - ~$0.01 per email processed

## Files Changed/Created
All files in `ps-email-agent/` directory:

```
ps-email-agent/
├── package.json              # Dependencies
├── .env                      # API keys (Anthropic, Airtable)
├── .env.example              # Template for env vars
├── SETUP.md                  # Setup instructions
├── src/
│   ├── index.js              # Express server with webhook endpoints
│   ├── config/
│   │   └── agent-config.js   # Intent definitions, routing config
│   ├── services/
│   │   ├── ai-agent.js       # Claude API integration (the brain)
│   │   ├── airtable.js       # Database operations
│   │   ├── email.js          # Microsoft Graph API (pending)
│   │   └── email-processor.js # Orchestration layer
│   ├── handlers/
│   │   ├── order-handler.js  # Order processing logic
│   │   ├── invoice-handler.js # Invoice dispute handling
│   │   └── general-handler.js # Questions, complaints, etc.
│   └── scripts/
│       └── test-agent.js     # Test script with 6 sample emails
└── knowledge/
    └── company-context.md    # Company info for AI context
```

## Key Learnings
- **Node.js v24 dotenv issue**: `dotenv.config()` parses but doesn't set `process.env` variables. Fix: `Object.assign(process.env, dotenvResult.parsed)`
- **Lazy initialization pattern**: Don't create API clients in constructors before env vars are loaded; use getter methods
- **Cost model**: Railway ~$5/mo fixed + Claude API ~$0.01/email = ~$5-10/month total for typical usage
- **The agent is not a chatbot**: It's a background worker that processes emails automatically, not something you interact with directly

## API Keys (for reference)
- **Anthropic**: Stored in `.env` file
- **Airtable**: Stored in `.env` file
- **Microsoft 365**: Pending setup with partner access

## Next Session TODO
1. Get Azure Portal access from partner
2. Register Azure AD app for Microsoft 365
3. Add MS credentials to `.env`
4. Push to GitHub
5. Deploy to Railway
6. Test with real emails
