---
name: sales-time
description: Complete outreach system - pulls qualified prospects, researches signals, updates HubSpot, connects on LinkedIn, and generates emails using Rob's voice and language principles.
---

# Sales Time

## Trigger Phrases
- "sales time"
- "let's do outreach"
- "who should I contact"
- "next prospect"

When Rob uses any of these, immediately start the workflow below.

---

## Purpose

One command. Complete outreach system.

1. Pull a qualified prospect from HubSpot
2. Research for buying signals
3. Update HubSpot with signal data
4. Connect on LinkedIn (face before name)
5. Generate email using Rob's voice
6. Track everything

---

## Two Tracks

| Track | Trigger | Goal | Timeline |
|-------|---------|------|----------|
| **Track 1 - Direct** | Signal found | Close deal | 60 days |
| **Track 2 - Content Funnel** | No signal | Warm up, build brand | 6-12 months |

**Track 1** hunts. **Track 2** farms. Run both.

---

## Language Principles

### Core Philosophy
- You are the prize, not the chaser
- Never pitch. Let them come to you.
- Questions > statements. Make them answer for themselves.
- Stack the pain, then offer relief
- "Or not" / "Unless you don't" > "Want to chat?"

### The Reagan Rule
Don't argue. Ask a question that makes them answer for themselves.
- Reagan: "Are you better off than you were four years ago?"
- Rob: "Are you sourcing pallets the same way you did last time? How'd that go?"

### Email Structure (Track 1 - Signal Found)
1. **Signal** - What you saw (specific, shows you did homework)
2. **Pain stack** - The reality of what that means for them (vendors, invoices, calls)
3. **Acknowledgment** - "You've done this before" / "You know how it goes"
4. **Relief hook** - "What if it wasn't your problem?" / "Unless you don't"
5. **Sign off** - Just "— Rob" (no CTA, no ask)

### Email Structure (Track 2 - No Signal)
1. **Pattern interrupt** - "Every year it's the same pitch..."
2. **Disarm** - "I'm not going to do that"
3. **Point to content** - "I wrote about what it actually looks like"
4. **Control to them** - "Only you know if it applies"
5. **Soft pointer** - "Pinned to my LinkedIn if you're curious"

### Closing Lines That Work

| Use This | Not This |
|----------|----------|
| "Or it doesn't." | "Let me know if you want to chat" |
| "Unless you don't." | "Happy to show you" |
| "What if it wasn't your problem?" | "Who handles this?" |
| "You know how it goes." | "I'm sure you're busy" |
| "Imagine that list just... not existing." | "We can help with that" |
| "— Rob" | "Looking forward to hearing from you" |

### Words to Avoid
- "Just following up"
- "Circling back"
- "Wanted to reach out"
- "Pick your brain"
- "Quick call"
- "15 minutes"
- "I'd love to"
- "Happy to"
- "Thanks so much for getting back"
- Any emoji

---

## Workflow

### Step 1: Pull Prospect from HubSpot

**Priority Order:**
1. A-tier first, then B-tier, then C-tier
2. Within each tier, prioritize by contact engagement:
   - Contacts who **clicked** (highest intent)
   - Contacts who **opened**
   - Contacts with **no engagement**

**Filters:**
- `prospect_tier` = a, b, or c
- `lifecyclestage` NOT IN [Customer, Live Account, Closed-Won, Closed-Lost]
- `notes_last_contacted` > 30 days ago OR null (never contacted)
- `last_signal_check` > 14 days ago OR null (don't re-research too soon)

**Pull one company at a time.**

---

### Step 2: Check for Contacts

Search contacts by company email domain.

**If contact found:**
- Note their name, title, email
- Check `hs_sales_email_last_clicked` and `hs_sales_email_last_opened`
- Check `hs_linkedin_url` (if exists)
- Check `linkedin_connected` (have we connected?)

**If no contact found:**
- Flag for LinkedIn prospecting
- Suggest search: "[Company] + Supply Chain Manager OR Procurement OR Logistics"
- Can still send to generic email if available, but Track 2 only

---

### Step 3: Research Signals

Run web searches for:

**Tier 1 Signals (High Intent - Track 1):**
```
"[Company] job posting supply chain logistics warehouse manager 2025 2026"
"[Company] expansion new facility distribution center 2025 2026"
"[Company] new VP operations supply chain director hired"
"[Company] RFP logistics pallet"
```

**Tier 2 Signals (Medium Intent - Track 1):**
```
"[Company] funding series acquisition 2025 2026"
"[Company] sustainability supply chain carbon goals"
"[Company] site:linkedin.com OR site:reddit.com pallet vendor complaint"
```

**What to capture:**
- Signal type
- Specific details (who, what, where, when)
- Source URL
- Timing/deadline if mentioned

---

### Step 4: Determine Track

| Scenario | Track | Tier Update |
|----------|-------|-------------|
| Tier 1 signal found | Track 1 - Direct | Keep or upgrade tier |
| Tier 2 signal found | Track 1 - Direct | Keep tier |
| No signal + contact engaged (clicked/opened) | Track 2 - Content Funnel | Keep tier |
| No signal + no engagement | Track 2 - Content Funnel | Consider downgrade |

---

### Step 5: Update HubSpot

**Company record:**
```
signal_type: [Job Posting / Expansion / Leadership Change / Funding / Sustainability / Complaint/Pain / RFP / None]
signal_details: "[Specific details - e.g., Hiring logistics mgr, Dallas - posted Jan 18]"
signal_source_url: [URL]
signal_date_found: [Today's date]
outreach_track: [Track 1 - Direct / Track 2 - Content Funnel]
outreach_angle: [Updated hook based on signal - use language principles]
last_signal_check: [Today's date]
prospect_tier: [Adjust if needed based on signal]
```

**Contact record (if exists):**
- Add note: "Signal found: [type] - [details]. Ready for outreach."

---

### Step 6: LinkedIn Actions (via Claude Chrome)

**If contact found:**
1. Open LinkedIn in Chrome
2. Search for "[Contact Name] [Company]"
3. Click **Connect** (no message - just connect)
4. Search for company page
5. Click **Follow** on company page
6. Update HubSpot contact:
   - `linkedin_connected`: Yes
   - `linkedin_connect_date`: Today

**If no contact found:**
1. Search for company page
2. Click **Follow** on company page
3. Note: "Find contact on LinkedIn: [Company] + [suggested titles]"

**Why no message on connect:**
- Messages on connect requests feel salesy
- Just connecting puts your face in their notifications
- They see you, check your profile, see your content
- Email hits 24-48 hours later - now they recognize you

---

### Step 7: Generate Email

**Track 1 - Signal Found:**

```
[First name] - [what you saw - the signal, specific]

[Pain stack - what that means for them: vendors, invoices, calls, time]

[Acknowledgment - "You've done this before" / "You know how it goes"]

[Relief hook - "What if it wasn't your problem?" / "Unless you don't" / "Or it doesn't"]

— Rob
```

**Example:**
```
Dante - 60 new market hubs by 2027.

That's 60 pallet vendor relationships. 60 quotes. 60 invoices. 60 calls when something breaks.

You've done this before. You know how it goes.

What if pallets just weren't your problem this time?

— Rob
```

---

**Track 2 - No Signal:**

```
Subject: Question on pallets

Every year it's the same pitch. Better pricing. Better service. Same results.

I'm not going to do that.

Instead, I wrote about what it actually looks like when someone else handles pallets for you. Real situations. Real outcomes.

Only you know if any of it applies to you.

It's pinned to my LinkedIn if you're curious.

— Rob
```

---

### Step 8: Output Format

```
═══════════════════════════════════════════════════════════════
SALES TIME - [TIER] TIER
═══════════════════════════════════════════════════════════════

COMPANY
───────────────────────────────────────────────────────────────
Name:           [Company Name]
Domain:         [domain.com]
Industry:       [Industry]
Facilities:     [Count]
Current Tier:   [A/B/C]
Last Contact:   [Date or "Never"]
HubSpot:        [Link]

CONTACT
───────────────────────────────────────────────────────────────
Name:           [First Last]
Title:          [Job Title]
Email:          [email@company.com]
Engagement:     [Clicked Jan 20 / Opened Dec 15 / None]
LinkedIn:       [URL or "Not on file"]
Connected:      [Yes / No]

SIGNAL RESEARCH
───────────────────────────────────────────────────────────────
Signal Type:    [Job Posting / Expansion / etc. / None]
Details:        [Specific details]
Timing:         [Deadline if found]
Source:         [URL]

TRACK ASSIGNMENT
───────────────────────────────────────────────────────────────
Track:          [Track 1 - Direct / Track 2 - Content Funnel]
Reason:         [Signal found / No signal but engaged / etc.]

HUBSPOT UPDATED ✓
───────────────────────────────────────────────────────────────
- signal_type: [value]
- signal_details: [value]
- signal_source_url: [value]
- outreach_track: [value]
- outreach_angle: [updated]
- last_signal_check: [today]

LINKEDIN ACTIONS
───────────────────────────────────────────────────────────────
[ ] Connect with [Contact Name] (no message)
[ ] Follow [Company] page

Ready to execute LinkedIn actions? (yes / skip)

EMAIL
───────────────────────────────────────────────────────────────
To: [email]
Subject: [subject line]

[Email body]

— Rob

───────────────────────────────────────────────────────────────
ACTIONS: send | edit | skip | next tier | stop
═══════════════════════════════════════════════════════════════
```

---

### Step 9: After Send

When Rob confirms send:
1. Update `notes_last_contacted` on company
2. Update `outreach_attempts` on contact (increment)
3. Update `out_reach_status` on contact
4. Move to next prospect

---

## Follow-Up Templates

### Track 1 Follow-Up (3-5 days, no response)

```
Not following up to pitch.

Just checking if the last one landed.

— Rob
```

### Track 2 Follow-Up (3-5 days, no response)

```
Not following up to pitch.

Just wanted to make sure the link worked.

If it didn't land, no worries. You know your situation better than I do.

— Rob
```

### Track 1 Follow-Up #2 (7-10 days, still no response)

```
Radio silence is an answer too.

If pallets aren't a headache right now, ignore me.

If they are - I'm around.

— Rob
```

---

## Responding to Replies

When Rob pastes a reply, generate a response using these principles:

### Guidelines
- Match their energy (short reply = short response)
- Don't over-explain
- Answer their question, then ONE follow-up question max
- Never sound eager or grateful
- Stay in prize frame
- Keep it under 50 words if possible

### Common Reply Types

**"What do you offer?"**
```
We run a 3PL for pallets. One vendor relationship instead of [X]. One invoice. One call when something breaks.

Easier to show than explain - want me to send a 2-minute overview?

— Rob
```

**"Send me more info"**
```
Here's a quick overview: [link or attachment]

If it fits, happy to dig into specifics. If not, no worries.

— Rob
```

**"We're happy with our current vendor"**
```
Good. That's rare.

If that ever changes, you know where to find me.

— Rob
```

**"Not interested"**
```
Noted. Appreciate the reply.

— Rob
```

**"Who are you?"**
```
Rob Kendall. I run Pallet Solutions - basically a 3PL for pallets.

Built it after watching companies drown in vendor management at my last gig.

[LinkedIn link] if you want the full story.

— Rob
```

**"Let's talk next quarter"**
```
Works for me. I'll reach back out in [month].

— Rob
```
(Then set a reminder/task in HubSpot)

**"How did you get my email?"**
```
Publicly listed on [source - LinkedIn, company site, etc.].

If you'd rather I didn't reach out, just say the word. No hard feelings.

— Rob
```

---

## HubSpot Property Reference

### Company Properties

| Property | Type | Values |
|----------|------|--------|
| `prospect_tier` | Dropdown | a, b, c, d |
| `signal_type` | Dropdown | Job Posting, Expansion, Leadership Change, Funding, Sustainability, Complaint/Pain, RFP, None |
| `signal_details` | Single-line text | Free text |
| `signal_source_url` | URL | Link |
| `signal_date_found` | Date | Date |
| `outreach_track` | Dropdown | Track 1 - Direct, Track 2 - Content Funnel |
| `outreach_angle` | Multi-line text | Free text |
| `last_signal_check` | Date | Date |
| `initiative_source` | Single-line text | Free text |
| `initiative_timing` | Single-line text | Free text |
| `facility_count` | Number | Integer |
| `linkedin_company_page` | URL | Link |
| `notes_last_contacted` | Date | Auto-set by HubSpot |

### Contact Properties

| Property | Type | Values |
|----------|------|--------|
| `hs_linkedin_url` | URL | Link |
| `linkedin_connected` | Checkbox | Yes/No |
| `linkedin_connect_date` | Date | Date |
| `outreach_attempts` | Number | Integer |
| `out_reach_status` | Dropdown | Existing values |
| `hs_sales_email_last_clicked` | Date | Auto-set |
| `hs_sales_email_last_opened` | Date | Auto-set |

### Lifecycle Stage Codes (Reference)

| Stage | Code |
|-------|------|
| Prospect | 1960117969 |
| Customer | 1959076578 |
| Live Account - In Service | 1485383375 |
| Closed - Won | 1485511382 |
| Closed - Lost | 1485511383 |
| Nurture | 1628263124 |
| Bad Fit | 1628263125 |
| Pallet Yard | 1512533738 |

---

## Edge Cases

### No contact at company
- Still research signals
- Still update HubSpot
- Follow company on LinkedIn
- Output: "Find contact: [Company] + Supply Chain Manager / Procurement / Logistics"
- Can send Track 2 email to info@ or generic if available

### Contact has no email
- Do LinkedIn connect
- Note in output: "No email on file - LinkedIn only"
- Add to contact: "Needs email - check LinkedIn or company site"

### Signal found but company was contacted recently (<30 days)
- Skip for now
- Note: "Strong signal but contacted [X] days ago. Revisit in [Y] days."

### Company is a duplicate
- Check domain against other records
- If duplicate, note which is primary
- Skip duplicate, work primary

### Contact at wrong company record
- Note the mismatch
- Suggest merging or reassigning contact

---

## Efficiency Tips

1. **Run LinkedIn actions in batches** - Connect with 5-10 people, then do emails
2. **Signal research is the bottleneck** - If no signal found quickly, move to Track 2
3. **Don't overthink Track 2** - Same email every time, just change the name
4. **Trust the process** - Track 1 closes deals, Track 2 builds the machine
5. **Speed on replies** - When someone responds, respond within minutes if possible

---

## Metrics to Track

| Metric | Target | Notes |
|--------|--------|-------|
| Track 1 reply rate | 10%+ | Signal-based should convert higher |
| Track 2 reply rate | 3-5% | Lower but builds brand |
| LinkedIn connect acceptance | 30%+ | No message = higher acceptance |
| Signal → Meeting | 20%+ | Strong signals should convert |
| Time to first reply | <5 min | Speed wins |

---

## Integration with Other Skills

**Feeds from:**
- `prospect-tiering` - Pre-tiered companies with research

**Works with:**
- Claude Chrome - LinkedIn automation
- HubSpot MCP - CRM updates

**Creates:**
- Outreach history in HubSpot
- Signal database for future reference
- Content engagement tracking (Track 2)
