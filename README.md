# Pallet Solutions Automation Skills

---

## Session Summary - January 28, 2026 (Session 2)

### What We Worked On
Built a complete sales outreach system for Pallet Solutions USA:
1. **sales-time skill** - Unified outreach workflow (prospect pulling, signal research, CRM updates, LinkedIn automation, email generation)
2. **X article** - "The Pallet Industry Has an Integrity Problem" - flagship content piece for Track 2 outreach

### Decisions Made
- **Two-track outreach strategy:** Track 1 (Direct) for signal-found prospects, close in 60 days. Track 2 (Content Funnel) for no-signal prospects, warm up over 6-12 months.
- **Contact-first workflow:** Start with engaged contacts (clicked > opened > no engagement), then find their companies. Guarantees every output has a contact to email.
- **Language principles:** Reagan question technique ("Are you better off..."), future pacing, pain stacking, prize frame. No pitching. You are the prize.
- **LinkedIn strategy:** Connect with no message (face before name), then email 24-48 hours later when they recognize you.
- **Work in Terminal (T), not Claude.ai (C):** Terminal has HubSpot MCP, web search, Claude Chrome, and file persistence. Claude.ai is now redundant.
- **Signal-based tiering replaces initiative-based:** Companies with buying signals outrank companies with just size/initiatives.

### Current State
- **sales-time skill:** Complete and ready to use. Trigger with "sales time" or "let's do outreach"
- **X article:** Sections 1-2 finalized, Section 3 drafted (needs review of Local Yards and National Providers subsections), Sections 4-6 not started
- **HubSpot:** 8 new properties needed (6 company, 2 contact) - user needs to create these

### Open Loops
- [ ] Review Section 3 subsections (Local Yards, National Providers) in the article
- [ ] Write Sections 4-6 of the article (what happens when things break, what I'd want if buying, the third option)
- [ ] Create 8 HubSpot properties for sales-time skill to function:
  - **Company:** signal_type, signal_details, signal_source_url, signal_date_found, outreach_track, last_signal_check
  - **Contact:** linkedin_connected, linkedin_connect_date
- [ ] Pallet Enterprise column invitation - haven't started

### Files Changed/Created
- `skills/sales-time/SKILL.md` - Complete sales outreach skill (new)
- `x-article-integrity-problem-DRAFT.md` - X article draft (new)
- `README.md` - Updated with session 2 summary

### Key Learnings
- **HubSpot manage_crm_objects format:** objectId must be a number (not string), objects array needs objectType inside each object
- **Engagement data lives at Contact level:** hs_sales_email_last_clicked and hs_sales_email_last_opened are contact properties, not company
- **Email voice principles:**
  - "Or it doesn't." > "Let me know if you want to chat"
  - "What if it wasn't your problem?" > "Who handles this?"
  - Just "— Rob" at the end, no CTA
  - Never: "just following up", "circling back", "quick call", "15 minutes", emojis
- **Track 2 emails point to content:** "It's pinned to my LinkedIn if you're curious" - no pitch, just point to value

---

## Session Summary - January 28, 2026 (Session 1)

### What We Worked On
Overhauled the `prospect-recon.skill` to improve cold email personalization by surfacing company incentives/targets and generating contextual hooks that show research without sounding like a pitch.

### Decisions Made
- **Removed "Reagan Questions"** - The ego-challenge approach ("are you doing X or not?") felt too confrontational for cold email where there's no existing relationship
- **Added "Homework Hooks"** - Observation-based lines that show you did research without asking questions or challenging them (e.g., "Third plant just went live. Arkansas is supposed to be the most efficient site - that usually means all the vendor relationships are getting a fresh look.")
- **Updated the CTA/Close line** - Changed from generic "15 minutes and you'll know if less headache is worth the call" to goal-specific closes like "15 minutes. You'll know if we can help you get to that 55%"
- **Added incentive/target searches** - New search queries specifically looking for investor presentations, annual reports, cost savings targets, sustainability goals, and named initiatives

### Current State
The `prospect-recon.skill` now:
1. Searches for company facilities/footprint
2. Searches for incentives, targets, KPIs from investor materials
3. Searches for strategic initiatives and sustainability goals
4. Searches for news/signals
5. Researches contact career arc
6. Outputs: Traffic light rating, US footprint, pallet type, strategic context, incentives & targets, homework hook, career arc, and cold email draft

### Recons Completed This Session
| Contact | Company | Rating | Key Hook |
|---------|---------|--------|----------|
| Scott Buchanan (VP EHS) | Avient | GREEN | 55% GHG reduction by 2030, already at 52% |
| Linnzi McDowell (Dir Strategic Sourcing) | TREX | GREEN | Third plant (Arkansas) just went live Q1 2025 |
| James Haas (Dir Systems) | Fyffes N.A. | GREEN | 99.6% to 100% recyclable packaging by end 2025 |
| Marvin Tignor (VP American Ops North) | Baltimore Aircoil | GREEN | 50% emissions reduction by 2030, ahead of pace |
| David Layman (SVP Operations) | La-Z-Boy | -- | RETIRED in 2012 - contact info outdated |

### Open Loops
- **David Layman (La-Z-Boy)** - Contact appears to have retired in fiscal 2012. Need to find current SVP Operations or Chief Supply Chain Officer (Mike Leggett was named CSCO in 2022)
- **Marvin Tignor (BAC)** - One LinkedIn profile shows "Retired" - verify he's still active before sending

### Files Changed/Created
- `prospect-recon.skill` - Major updates to search queries, output format, homework hooks section, and CTA close format

### Key Learnings
- **Homework hooks > questions** - In cold email, observations work better than questions. "Third plant just went live" beats "Is pallet spend part of that initiative?"
- **Tie the close to their goal** - "15 minutes. You'll know if we can help you get to that 55%" is more compelling than generic "less headache" language
- **Verify contact status** - Always check if senior leaders have retired before sending (David Layman, possibly Marvin Tignor)
- **Sustainability targets are gold** - Specific numbers like "52% toward 55%" or "99.6% to 100%" create natural hooks and urgency

### Email Formula (Current)
```
Subject: [Specific number or location from their world]

> [Career arc line 1 - specific titles, progression]
>
> [Career arc line 2 - acknowledgment of what they've built]
>
> [Homework hook - observation about their specific situation/target]
>
> [Bridge - "I built a pallet network that..." variation]
>
> 15 minutes. You'll know if we can help you [their specific goal].
```

---

## Skills Reference

| Skill | Trigger | Purpose |
|-------|---------|---------|
| sales-time | "sales time", "let's do outreach" | Full outreach workflow - pull prospect, research signals, update HubSpot, LinkedIn actions, generate email |
| prospect-tiering | "tier prospects", "continue tiering" | Research and tier HubSpot companies by initiative/timing |
| prospect-recon | "recon [contact]" | Deep research on specific contact for personalized outreach |

## Project Structure
```
Take over the world 2030/
├── skills/
│   └── sales-time/
│       └── SKILL.md
├── temp_tiering/
│   └── prospect-tiering/
│       └── SKILL.md
├── x-article-integrity-problem-DRAFT.md
├── prospect-recon.skill
└── README.md
```
