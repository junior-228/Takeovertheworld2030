---
name: sales-time
description: Batch cold email workflow. Pulls tiered prospects from HubSpot, finds best contact by title, researches company initiative, generates locked-format email, sends on approval.
---

# Sales Time

## Trigger Phrases
- "sales time"
- "cold email batch"
- "let's send some emails"
- "outreach time"

## Purpose
Batch process cold emails for tiered prospects. Pulls companies already researched (Tier A/B/C), finds the right contact, researches company initiatives, generates email in locked format, waits for approval, sends via HubSpot.

---

## The Core Pitch

**What we're NOT selling:**
- Pallets (commodity - anyone can sell wood)
- Lowest price
- Service (vendors do the delivery, not us)

**What we ARE selling:**
- Embedded expertise without the headcount
- "You could hire someone with 10 years of pallet industry experience. Or you could pay me a fraction of that - and I disappear until you need me."

---

## Email Structure (NON-3PL)

**The Formula:**
1. **Company incentive** - Their public initiative (cost savings target, sustainability goal, expansion, emissions reduction, efficiency program)
2. **The question** - "Are pallets part of that?"
3. **The expertise pitch** - "Do you have someone with 10 years of pallet industry experience making sure you're getting the best rate?"
4. **What I do** - "Vet the vendors, get you the best pricing, manage the coordination. You get the expertise without the headcount - and I disappear until you need me."
5. **The closer** - "15 minutes and you'll know whether to hire for this - or hand it off."

**Template:**
```
Subject: [Specific number or initiative - e.g., "$200M savings target" or "Blue Polymers + 300M lbs"]

[Company incentive - 1-2 sentences about their PUBLIC initiative: cost savings, sustainability, expansion, efficiency target]

Are pallets part of that? Do you have someone with 10 years of pallet industry experience making sure you're getting the best rate?

That's what I do. Vet the vendors, get you the best pricing, manage the coordination. You get the expertise without the headcount - and I disappear until you need me.

15 minutes and you'll know whether to hire for this - or hand it off.
```

**Target: 85-95 words max.**

---

## Email Structure (3PL TARGETS)

For 3PLs, use Eric's pitch - they get it immediately because it mirrors their own value prop.

**Template:**
```
Subject: [Specific - facility count, region, or initiative]

[1-2 sentences acknowledging what they do]

I am you in the pallet space. I do for you what you're doing for your customers.

I run this in the background - one thing you don't have to worry about. We execute, get out of the way, and stay in the background until you need us or we spot a problem.

15 minutes and you'll know whether to hire for this - or hand it off.
```

---

## Alternate Hooks

**If they're hiring for sourcing/procurement:**
```
Saw you're hiring a [title]. Until that seat's filled - or even after - do you have someone with 10 years of pallet industry experience making sure you're getting the best rate?
```

**If you know their last RFP didn't stick:**
```
Quick question - how was your last pallet RFP? If it was great, you wouldn't be doing another one.

I'm not here to sell you pallets. I'm here to make them something you never think about again.
```

---

## Subject Line Rules

**USE:**
- Initiative + number: "$200M savings target", "Blue Polymers + 300M lbs"
- Specific goals: "Net zero by 2030", "15% cost reduction"
- Facility references tied to initiative: "4 new recycling facilities"

**NEVER USE:**
- Generic: "Quick question", "Pallet opportunity", "Let's connect"
- Company name alone: "Merck", "CAVA"
- Facility count alone without initiative context
- Anything that sounds like spam

---

## Research Priority

**Step 1: Check outreach_angle in HubSpot**
- Look for $$ anchors, initiatives, public commitments
- This is pre-researched - use it if it has a real initiative

**Step 2: Web search for public initiatives**
- Cost savings targets ("$200M efficiency program")
- Sustainability goals ("net zero by 2030", "50% emissions reduction")
- Expansion tied to a stated goal
- Efficiency or operational improvement programs
- Recent press releases with specific commitments

**Step 3: Verify they use pallets**
- Manufacturing facilities = yes
- Distribution centers = yes
- Retail stores only = probably not worth it
- If unclear, ask Rob before drafting

**SKIP if no public initiative found** - facility count alone isn't enough. Need a stated goal or commitment to lead with.

---

## Workflow

### Step 1: Pull Prospects from HubSpot
```
Filter companies:
- prospect_tier IN (a, b, c)
- research_status = fully_researched

Filter contacts (EXCLUDE):
- hs_lead_status = "follow_up" (already emailed - do NOT pull)

Limit: 10 companies per batch
Order: Tier A first, then B, then C
```

**CRITICAL:** Only pull contacts where `hs_lead_status` is NOT "follow_up". Anyone marked "follow_up" has already been emailed and should not appear in sales-time batches.

### Step 2: Select Best Contact by Title Priority

1. VP/Director of Supply Chain
2. VP/Director of Operations
3. VP/Director of Procurement
4. VP/Director of Logistics
5. Category Manager
6. Distribution Center Manager
7. Any VP/Director level in ops

### Step 3: Research Company Initiative (2 searches max)

**Search 1:** Company + cost savings OR efficiency OR sustainability goal
**Search 2:** Company + 2025 2026 initiative OR target OR commitment

**Extract:**
- Public cost savings targets
- Sustainability/emissions goals
- Efficiency programs with numbers
- Expansion tied to stated objectives

### Step 4: Generate Email

Use the NON-3PL or 3PL template based on company type.

**Before presenting, check:**
- Does the subject line reference their PUBLIC initiative (not just facility count)?
- Does the opener lead with THEIR stated goal, not our pitch?
- Is it under 95 words?
- Does it end with "hire for this - or hand it off"?

### Step 5: Present for Approval
```
---
PROSPECT [X] of 10

Company: [Name] (Tier [A/B/C])
Contact: [Name], [Title]
Email: [email]

Public Initiative:
[What you found - cost savings target, sustainability goal, efficiency program, etc.]

---
Subject: [subject line]

[Email body]

---
[ APPROVE ] [ EDIT ] [ SKIP ]
```

### Step 6: On Approval
- Log email to HubSpot contact record
- **Set contact's `hs_lead_status` to "follow_up"** (prevents them from appearing in future batches)
- Confirm sent
- Move to next prospect

### Step 7: Batch Summary
```
---
SESSION COMPLETE

Sent: X emails
Skipped: X
Edited: X

Tier breakdown:
- A: X sent
- B: X sent
- C: X sent
---
```

---

## Banned Phrases (auto-delete if found)

- "I'd love to connect"
- "Reach out"
- "Touch base"
- "Best-in-class"
- "Revolutionary"
- "Comprehensive solution"
- "Partner with you"
- "Here's what we do"
- "Our services include"
- "Access to 1,400 vendors"
- "Complete transparency"
- "Worth the call"
- "Hoping to"
- "Just wanted to"

---

## Quality Check

Before presenting any email:

1. **Initiative test:** Does it lead with THEIR public commitment/goal?
2. **Specificity test:** Is there a real number or stated target in the subject line?
3. **Expertise test:** Does it position us as "the person you'd hire but don't need to"?
4. **Length test:** Under 95 words?
5. **Closer test:** Does it end with a decision frame, not a soft ask?

---

## Skip Criteria

**SKIP the prospect if:**
- No public initiative found (facility count alone isn't enough)
- Contact is retiring or leaving (check LinkedIn)
- Company doesn't use pallets (retail stores only, no manufacturing/DC)
- Contact's `hs_lead_status` = "follow_up" (already emailed)
- No email address available

---

## Example Emails

**Example 1: Sustainability initiative**
```
Subject: Blue Polymers + 300M lbs

You're building out Blue Polymers - 4 new facilities, 300 million pounds of recycled plastics a year. Are pallets part of that ramp-up?

Do you have someone with 10 years of pallet industry experience making sure you're getting the best rate as you scale?

That's what I do. Vet the vendors, get you the best pricing, manage the coordination. You get the expertise without the headcount - and I disappear until you need me.

15 minutes and you'll know whether to hire for this - or hand it off.
```

**Example 2: Cost savings target**
```
Subject: $200M savings target

You've committed to $200M in operational savings by 2026. Are pallets part of that?

Do you have someone with 10 years of pallet industry experience making sure you're getting the best rate across your facilities?

That's what I do. Vet the vendors, get you the best pricing, manage the coordination. You get the expertise without the headcount - and I disappear until you need me.

15 minutes and you'll know whether to hire for this - or hand it off.
```

**Example 3: Emissions reduction goal**
```
Subject: Net zero by 2030

You've committed to net zero by 2030. Supply chain's a big piece of that - are pallets part of the plan?

Do you have someone with 10 years of pallet industry experience making sure you're sourcing sustainably and getting the best rate?

That's what I do. Vet the vendors, get you the best pricing, manage the coordination. You get the expertise without the headcount - and I disappear until you need me.

15 minutes and you'll know whether to hire for this - or hand it off.
```

**Example 4: 3PL target**
```
Subject: 40 DCs

You're running 40 distribution centers for customers who expect you to make logistics disappear.

I am you in the pallet space. I do for you what you're doing for your customers.

I run this in the background - one thing you don't have to worry about. We execute, get out of the way, and stay in the background until you need us or we spot a problem.

15 minutes and you'll know whether to hire for this - or hand it off.
```

---

## Trigger Confirmation

When Rob says "sales time", confirm:
```
Ready to pull 10 prospects and draft cold emails.
Tier priority: A → B → C
Format: Public initiative → Are pallets part of that? → Expertise pitch → Closer

Starting now...
```

Then begin Step 1.
