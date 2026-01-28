# Pallet Solutions Automation Skills

## Session Summary - January 28, 2026

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
