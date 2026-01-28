# The Pallet Hub

## What Is It?
The Pallet Hub is Pallet Solutions' custom-built **Order-to-Cash Automation System**. It's an AI-powered operations platform that handles the entire lifecycle of a pallet order - from the moment a customer sends an email to the moment payment hits the bank.

Think of it as a custom ERP built specifically for pallet logistics, without the $50k+ price tag or bloated features you'll never use.

---

## The Elevator Pitch
> "The Pallet Hub automatically reads customer order emails, creates orders in our system, generates BOLs, tracks deliveries, processes PODs when vendors send photos back, creates invoices, and tells us who owes money and who we need to pay. Humans only step in when something's weird."

---

## What It Does

### 1. **Automated Order Intake**
Customer sends email → AI reads it → Order created in system
- Recognizes customer by email
- Extracts what they want (product, quantity, date)
- Flags anything unclear for human review

### 2. **Fulfillment Tracking**
Order → Assigned to vendor → Delivery scheduled → BOL generated
- Auto-generates professional BOLs (branded PDFs)
- Tracks delivery status: OPEN → SERVICED → CLOSED → COMPLETED
- 48-hour SLA tracking built in

### 3. **POD Processing**
Vendor takes photo of signed BOL → Emails it back → AI reads the counts
- Extracts handwritten quantities from photos
- Updates inventory/delivery records
- Flags variances automatically

### 4. **Invoicing & AR**
Delivery complete → Invoice generated → Sent to customer → Payment tracked
- Auto-calculates charges and credits (cores, pickups)
- Tracks who owes us, who's overdue
- One number system: BOL 47 = Invoice 47

### 5. **AP Management**
Vendor invoices tracked → Approval workflow → Payment tracking
- Know who we need to pay and when
- Track what's overdue

### 6. **Exception Handling**
When automation can't figure something out → Creates escalation → Human resolves
- Nothing falls through the cracks
- Audit trail on everything

---

## The Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Database | Airtable | All data lives here - customers, orders, deliveries, invoices |
| Automation | Make.com | Connects everything, runs workflows |
| AI Brain | Claude API | Reads emails, extracts data, reads POD photos |
| Email | Outlook | Inbound orders, outbound confirmations/invoices |
| Documents | HTML → PDF | BOLs, invoices, generated on demand |
| Interface | Airtable Interfaces | Dashboards, data entry (future: customer portal) |

---

## The Data Model

```
CUSTOMERS
    └── FACILITIES (ship-to locations)
            └── CONTACTS (people who can order)

ORDERS
    └── ORDER LINE ITEMS
            └── linked to LINE ITEM TYPES (products)

DELIVERIES (BOLs)
    └── DELIVERY LINE ITEMS
            └── linked to LINE ITEM TYPES

CUSTOMER INVOICES → linked to Customers, Orders, Deliveries
VENDOR INVOICES → linked to Vendors, Order Line Items
ESCALATIONS → linked to everything (exception handling)
```

---

## Status Flows

### Order Lifecycle
```
OPEN → SERVICED → CLOSED → COMPLETED
  │        │          │         │
Order   Delivery    POD      Payment
placed  happened   received  processed
```

### Invoice Lifecycle
```
DRAFT → SENT → PARTIAL → PAID
  │       │        │        │
Created  Emailed  Some     Fully
         to AP    paid     paid
```

---

## SLA Rules
- **No date given** = 48 hours from order (ASAP)
- **Date given** = that's the promise date
- **Overdue** = past promise date and still OPEN

---

## Build Roadmap

### Phase 1: Foundation ✅ COMPLETE
- All 12 Airtable tables built
- Data model established
- Relationships linked

### Phase 2: Automation Build ← IN PROGRESS
- [x] BOL template (HTML, branded)
- [x] Invoice template (HTML, branded)
- [ ] Airtable status fields updated
- [ ] Make.com: Email parsing (orders)
- [ ] Make.com: BOL generation
- [ ] Make.com: POD parsing (Claude vision)
- [ ] Notification flows

### Phase 3: Reconciliation
- [ ] POD → Delivery matching
- [ ] Auto invoice generation
- [ ] Payment tracking

### Phase 4: Customer Portal
- [ ] Customer-facing interface
- [ ] Order status lookup
- [ ] Scrap/rebate dashboard

---

## Implementation Plan

**Week 1: Core Order Flow**
- Connect Outlook inbox to Make.com
- Build Claude prompt for order parsing
- Auto-create Orders + Line Items in Airtable
- Low confidence → Escalation

**Week 2: BOL Generation**
- Trigger on Order status change
- Pull data, fill HTML template
- Convert to PDF, attach to Delivery

**Week 3: POD & Invoicing**
- Watch POD inbox for vendor photos
- Claude vision extracts counts
- Update Delivery Line Items
- Generate Invoice when ready

**Week 4: Polish & Go Live**
- Error alerts (when automation fails)
- Daily digest emails
- Edge case handling
- Live with real orders

---

## What This Replaces

| Before | After (Pallet Hub) |
|--------|-------------------|
| Read emails manually | AI reads and creates orders |
| Type BOLs in Word/Excel | Auto-generated branded PDFs |
| Track deliveries in spreadsheet | Real-time status dashboard |
| Chase vendors for PODs | Auto-parsed from photos |
| Create invoices manually | Auto-generated from delivery data |
| Wonder who owes money | One query: "Who's overdue?" |

---

## Cost Comparison

**Traditional ERP/OMS:** $500-$2000/month + implementation fees
**The Pallet Hub:**
- Airtable: ~$20/month (Pro plan)
- Make.com: ~$29/month (Core plan)
- Claude API: ~$20-50/month (usage based)
- **Total: ~$70-100/month**

And it's built exactly for how Pallet Solutions operates.

---

## Key Metrics to Track (Future)
- Orders processed per day
- Auto-process rate (% without human touch)
- Average time: order → delivery
- POD turnaround time
- AR aging (who's overdue)
- Escalation volume

---

## Project Vision
Fully automated order processing system where customer emails flow through to delivery and invoicing with human intervention only for exceptions.

## Current Status: PHASE 2 IN PROGRESS

### Build Sequence
- [x] **PHASE 1: FOUNDATION** ✅ COMPLETE
  - [x] Line Item Types table
  - [x] Deliveries table
  - [x] Delivery Line Items table
  - [x] Customers table
  - [x] Facilities table
  - [x] Contacts table
  - [x] Vendors table
  - [x] Orders table
  - [x] Order Line Items table
  - [x] Escalations table
  - [x] Customer Invoices table
  - [x] Vendor Invoices table
  - [x] All table links verified

- [ ] **PHASE 2: AUTOMATION BUILD** ← IN PROGRESS
  - [x] BOL HTML template (bol-template.html)
  - [x] Invoice HTML template (invoice-template.html)
  - [ ] Update Airtable status fields
  - [ ] Make.com BOL generation scenario
  - [ ] Make.com POD email parsing (Claude vision)
  - [ ] Make.com email parsing scenario (Claude)
  - [ ] Vendor confirmation flow
  - [ ] Customer notification flow

- [ ] **PHASE 3: RECONCILIATION**
  - [ ] POD matching logic
  - [ ] Invoice generation automation
  - [ ] Payment tracking

- [ ] **PHASE 4: CUSTOMER PORTAL**
  - [ ] Airtable Interface for customers
  - [ ] Scrap/rebate dashboard

---

## Airtable Configuration

### Base Info
- **Base Name:** Pallet Solutions Operations
- **Base ID:** appQYT3aaMX1SzO7M

---

## All Tables Built

### 1. Line Item Types ✅
**Purpose:** Lookup table for all products/services on BOLs
**Fields:** Display Name, Category, Dimension, Finish Type, Grade, Heat Treated, Default Billing Type, Short Code, Is Active, Sort Order
**Links to:** None (other tables link TO this)
**Pre-populated:** 25 records (New, Remanufactured, Recycled grades, Heat Treated, Cores, Odds, Scrap, Services)

### 2. Deliveries ✅
**Purpose:** BOL header - each record is one delivery/BOL
**Fields:** Delivery ID (DEL-), Delivery Type, Status, Customer Name, Customer Address, City, State, Zip, Customer PO, Expected Date, Transport Method, Delivery Window, Trailer Number, Driver Name, Notes, Released By, Received By, Date Signed, POD Attachment, POD Status, Line Items
**Links to:** Delivery Line Items

### 3. Delivery Line Items ✅
**Purpose:** Individual items on each BOL
**Fields:** Line ID, Delivery, Line Item Type, Description (lookup), Category (lookup), Default Billing (lookup), Expected Qty, Loaded Qty, Qty Variance (formula), Billing Type, Unit Price, Line Total (formula), Notes, Sort Order
**Links to:** Deliveries, Line Item Types

### 4. Customers ✅
**Purpose:** Customer master data
**Fields:** Customer Name, Customer ID (CUST-), Status, Billing Address, City, State, Zip, Primary Contact, Primary Email, Primary Phone, AP Contact, AP Email, Payment Terms, Credit Limit, Tax Exempt, Tax Exempt ID, Notes, Facilities, Created Date, Last Modified
**Links to:** Facilities

### 5. Facilities ✅
**Purpose:** Ship-to locations for each customer
**Fields:** Facility Name, Facility ID (FAC-), Customer, Status, Address, City, State, Zip, Receiving Contact, Receiving Phone, Receiving Email, Receiving Hours, Delivery Window, Delivery Instructions, Dock Type, Appointment Required, Is Primary, Notes, Created Date
**Links to:** Customers

### 6. Contacts ✅
**Purpose:** People who can place orders (verified senders)
**Fields:** Contact Name, Contact ID (CON-), Email, Phone, Facility, Role, Can Place Orders, Is Primary Contact, Receives Confirmations, Receives Delivery Alerts, Receives Invoices, Status, Notes, Created Date
**Links to:** Facilities

### 7. Vendors ✅
**Purpose:** Pallet suppliers
**Fields:** Vendor Name, Vendor ID (VND-), Status, Address, City, State, Zip, Primary Contact, Primary Email, Primary Phone, Payment Terms, Lead Time Days, Products Offered, Sizes Offered, Notes, Created Date
**Links to:** None (other tables link TO this)

### 8. Orders ✅
**Purpose:** Customer orders
**Fields:** Order Number (ORD-), Customer, Facility, Status, Order Date, Requested Date, Customer PO, Reference Number, Order Source, Placed By Contact, Parse Confidence, Auto Processed, Special Instructions, Assigned Vendor, Vendor Confirmed, Vendor Confirmed Date, Created Date, Last Modified
**Links to:** Customers, Facilities, Contacts, Vendors

### 9. Order Line Items ✅
**Purpose:** Individual items on each order
**Fields:** Line ID, Order, Line Item Type, Description (lookup), Category (lookup), Qty Ordered, Qty Shipped, Qty Backorder (formula), Unit Price, Line Total (formula), Vendor, Notes, Status, Created Date
**Links to:** Orders, Line Item Types, Vendors

### 10. Escalations ✅
**Purpose:** Exception handling for automation
**Fields:** Escalation ID (ESC-), Type, Priority, Status, Subject, Email From, Email Subject, Email Body, Email Received, Original Email, Parse Attempt, Confidence Score, Related Customer, Related Facility, Related Order, Related Contact, Assigned To, Resolution Notes, Resolution Action, Resolved Date, Created Date
**Links to:** Customers, Facilities, Orders, Contacts

### 11. Customer Invoices ✅
**Purpose:** AR tracking - invoices to customers
**Fields:** Invoice Number (INV-), Customer, Status, Invoice Date, Due Date, Orders, Deliveries, Subtotal, Tax Rate, Tax Amount, Total Due, Amount Paid, Balance Due, Payment Terms, Sent Date, Paid Date, Payment Method, Payment Reference, Invoice PDF, Notes, Created Date
**Links to:** Customers, Orders, Deliveries

### 12. Vendor Invoices ✅
**Purpose:** AP tracking - invoices from vendors
**Fields:** Vendor Invoice Number, Our Reference (VPAY-), Vendor, Status, Invoice Date, Due Date, Amount, Order Line Items, Paid Date, Payment Method, Payment Reference, Invoice Document, Notes, Created Date
**Links to:** Vendors, Order Line Items

---

## Table Relationship Map

```
CUSTOMERS ←──────────────────────────────────────────┐
    │                                                │
    ↓ has many                                       │
FACILITIES ←─────────────────────────────────────┐   │
    │                                            │   │
    ↓ has many                                   │   │
CONTACTS ─────────────────────────────────────┐  │   │
    │                                         │  │   │
    │    ┌────────────────────────────────────┼──┼───┘
    │    │    ┌───────────────────────────────┼──┘
    │    │    │                               │
    ↓    ↓    ↓                               ↓
   ORDERS ────────────────────────────────→ VENDORS
    │                                         ↑
    ↓ has many                                │
ORDER LINE ITEMS ─────────────────────────────┤
    │         │                               │
    │         ↓                               │
    │    LINE ITEM TYPES ←────────────────────┤
    │                                         │
    │                   ┌─────────────────────┘
    ↓                   ↓
VENDOR INVOICES ────→ VENDORS

DELIVERIES
    │
    ↓ has many
DELIVERY LINE ITEMS ───→ LINE ITEM TYPES

CUSTOMER INVOICES ───→ CUSTOMERS, ORDERS, DELIVERIES

ESCALATIONS ───→ CUSTOMERS, FACILITIES, ORDERS, CONTACTS
```

---

## Material Categories (Business Logic)

| Category | Definition | Size | Billing Default |
|----------|------------|------|-----------------|
| Finished Goods | Ready-to-use pallets | Any | Charge |
| Cores | Repairable 48x40 ONLY | 48x40 | Credit (deal-dependent) |
| Odds | Repairable non-48x40 | NOT 48x40 | Credit (deal-dependent) |
| Scrap | Unrepairable/junk | Any | Charge (disposal) |
| Service | Labor/logistics | N/A | Charge |

---

## Design Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-18 | Contacts table separate from Customers | Multiple contacts per facility with individual permissions |
| 2026-01-18 | "Can Place Orders" checkbox on Contacts | Simple boolean for sender verification |
| 2026-01-18 | Escalations as separate table | Clean audit trail, track resolution time |
| 2026-01-18 | Line Item Types as flexible Display Name | Allows "Heat Treated B Grade 48x40" style naming |
| 2026-01-18 | Cores = 48x40 only, Odds = non-48x40 | Clear business definition |
| 2026-01-18 | BOL = POD (same document) | Unsigned BOL becomes signed POD |
| 2026-01-18 | "Dimension" not "Size" | User preference |
| 2026-01-18 | Deliveries standalone (not linked to Orders yet) | Can add link later when workflow is clearer |

---

## Session Notes

### Session 1 - 2026-01-18
**Focus:** Architecture planning
**Completed:** Automation vision, escalation paths, Claude parsing prompt design

### Session 2 - 2026-01-18 (continued)
**Focus:** Building ALL Airtable tables
**Completed:**
- 12 tables built with full field definitions
- All table links established and verified
- Pre-populated Line Item Types with 25 product/service records
- Project file updated as persistent memory

**Tables Built:**
1. Line Item Types (10 fields, 25 records)
2. Deliveries (21 fields)
3. Delivery Line Items (14 fields)
4. Customers (20 fields)
5. Facilities (19 fields)
6. Contacts (14 fields)
7. Vendors (16 fields)
8. Orders (18 fields)
9. Order Line Items (14 fields)
10. Escalations (21 fields)
11. Customer Invoices (21 fields)
12. Vendor Invoices (14 fields)

**Next Session Options:**
- Build BOL HTML template + Make.com generation
- Build email parsing automation (Claude + Make.com)
- Add rollup fields (totals) to Deliveries and Orders
- Create Airtable Interface for data entry

---

## Status Flow & Numbering

### Unified Numbering System
BOL and Invoice share the same number for easy tracking:
- **BOL 47** → **Invoice 47** (IN-47)
- Delivery ID is the master number

### Order Status Flow
```
OPEN → SERVICED → CLOSED → COMPLETED
  │        │         │          │
Order   Delivery   POD       Payment
placed  happened   received  processed
```

**Status Definitions:**
| Status | Meaning | Trigger |
|--------|---------|---------|
| OPEN | Order received, pending fulfillment | Order created |
| SERVICED | Delivery/pickup completed | Driver confirms delivery |
| CLOSED | POD received and verified | POD uploaded to Airtable |
| COMPLETED | Payment processed | Payment recorded |

### Invoice Status Flow
```
DRAFT → SENT → PARTIAL → PAID
  │       │       │        │
Created  Emailed  Some    Fully
         to AP    paid    paid
```

### Airtable Fields to Add/Update

**Orders table - update Status field options:**
- OPEN
- SERVICED
- CLOSED
- COMPLETED
- CANCELLED

**Customer Invoices table - update Status field options:**
- DRAFT
- SENT
- PARTIAL
- PAID
- VOID

**Vendor Invoices table - update Status field options:**
- PENDING
- APPROVED
- PAID

### Accounting Query Support
For Claude to answer "who owes us" / "who needs paid":

**AR (Accounts Receivable) - Who owes us:**
- Filter Customer Invoices where Status = SENT or PARTIAL
- Filter where Due Date < Today for overdue
- Rollup Balance Due by Customer

**AP (Accounts Payable) - Who we need to pay:**
- Filter Vendor Invoices where Status = PENDING or APPROVED
- Filter where Due Date < Today for overdue
- Rollup Amount by Vendor

---

## How to Continue

Tell Claude:
> "Read PALLET_SOLUTIONS_AUTOMATION_PROJECT.md and continue where we left off"

or

> "Check the project file - what's next?"

---

## Make.com Automation Specifications

### Scenario 1: Inbound Order Processing

**Name:** `Pallet Hub - Inbound Order Processing`
**Trigger:** Every 5 minutes (or Outlook webhook)
**Purpose:** Email → Order → Vendor Confirmation Request

#### Flow Diagram
```
CUSTOMER EMAIL
     │
     ▼
[Outlook: Watch Emails]
     │
     ▼
[Airtable: Search Contacts by email]
     │
     ├── NOT FOUND → Create Escalation (UNKNOWN_SENDER) → STOP
     │
     ├── Can't Place Orders → Log only → STOP
     │
     ▼
[Airtable: Get Facility details]
     │
     ▼
[Airtable: Get Customer details]
     │
     ▼
[Airtable: List Line Item Types]
     │
     ▼
[HTTP: Call Claude API - Parse Email]
     │
     ▼
[JSON: Parse Claude Response]
     │
     ▼
[Router: Classification]
     │
     ├── GENERAL_INQUIRY → Log → STOP
     ├── UNCLEAR → Create Escalation → STOP
     ├── Low Confidence (<0.7) → Create Order + Escalation
     └── Good Order (>=0.7) → Create Order
           │
           ▼
     [Airtable: Create Order]
           │
           ▼
     [Iterator: Loop line_items]
           │
           ▼
     [Airtable: Create Order Line Items]
           │
           ▼
     [Airtable: Find Best Vendor]
           │
           ▼
     [Airtable: Update Order with Vendor]
           │
           ▼
     [Email: Send Vendor Confirmation Request]
```

#### Module Details

**Module 1: Outlook - Watch Emails**
- Folder: Inbox (or "Orders" folder)
- Mark as Read: Yes
- Outputs: from, subject, body, receivedDateTime

**Module 2: Airtable - Search Contacts**
- Table: Contacts
- Formula: `LOWER({Email}) = LOWER("{{sender_email}}")`
- Returns: Contact ID, Can Place Orders, Facility link

**Module 9: HTTP - Claude API Call**
- URL: `https://api.anthropic.com/v1/messages`
- Method: POST
- Headers: x-api-key, anthropic-version, Content-Type
- Model: claude-sonnet-4-20250514

#### Claude Parsing Prompt
```
You are an order processing assistant for Pallet Solutions.

KNOWN CUSTOMER CONTEXT:
- Customer: {{customer_name}}
- Facility: {{facility_name}}
- Address: {{facility_address}}
- Contact: {{contact_name}}

AVAILABLE PRODUCTS:
{{product_list}}

TODAY'S DATE: {{current_date}}

EMAIL:
From: {{sender}}
Subject: {{subject}}
Body: {{body}}

Respond with JSON only:
{
  "classification": "ORDER_REQUEST" | "PICKUP_REQUEST" | "GENERAL_INQUIRY" | "UNCLEAR",
  "confidence": 0.0-1.0,
  "requested_date": "YYYY-MM-DD" or null,
  "is_asap": true/false,
  "line_items": [
    {
      "product_description": "what they asked for",
      "matched_product": "exact match or null",
      "quantity": number or null,
      "item_confidence": 0.0-1.0
    }
  ],
  "customer_po": "PO number or null",
  "special_instructions": "any notes",
  "ambiguities": ["list of unclear items"],
  "summary": "one sentence description"
}

CONFIDENCE: 0.9+ auto-process, 0.7-0.9 flag for review, <0.7 escalate
```

---

### Scenario 2: Vendor Confirmation Handler

**Name:** `Pallet Hub - Vendor Confirmation`
**Trigger:** Every 5 minutes
**Purpose:** Vendor CONFIRM reply → Delivery → BOL → Customer Notification

#### Flow Diagram
```
VENDOR REPLY (contains "CONFIRM")
     │
     ▼
[Text Parser: Extract Order #]
     │
     ▼
[Filter: Contains "CONFIRM"]
     │
     ▼
[Airtable: Find Order]
     │
     ▼
[Airtable: Update Order]
  - Vendor Confirmed: TRUE
  - Vendor Confirmed Date: Now
  - Status: SCHEDULED
     │
     ▼
[Airtable: Create Delivery]
     │
     ▼
[Iterator: Copy Order Line Items → Delivery Line Items]
     │
     ▼
[HTTP: Generate BOL PDF]
     │
     ▼
[Airtable: Attach BOL to Delivery]
     │
     ▼
[Email: Send BOL to Vendor]
     │
     ▼
[Email: Send Confirmation to Customer]
```

---

### Email Templates

#### Vendor Confirmation Request
```
Subject: Order Confirmation Needed - {{customer_name}} - {{requested_date}}

Hi {{vendor_contact}},

We have a new order that needs your confirmation:

ORDER DETAILS:
Order #: {{order_number}}
Customer: {{customer_name}}
Location: {{facility_address}}, {{city}}, {{state}}
Requested Date: {{requested_date}}

MATERIALS NEEDED:
{{line_items_list}}

SPECIAL INSTRUCTIONS:
{{special_instructions}}

Please reply CONFIRM to accept this order.

Thanks,
Pallet Solutions
```

#### Customer Confirmation
```
Subject: ✓ Order Confirmed - {{order_number}}

Hi {{contact_name}},

Your order has been confirmed and scheduled.

ORDER CONFIRMATION:
Order #: {{order_number}}
BOL #: {{delivery_id}}
Date: {{expected_date}}
Location: {{facility_name}}

MATERIALS:
{{line_items_list}}

Our driver will arrive during your standard receiving hours.

Thank you for your business!
Pallet Solutions
```

---

### Required Connections

1. **Microsoft 365 Email** - Outlook inbox access
2. **Airtable** - API key from airtable.com/account
3. **Claude API** - Key from console.anthropic.com
4. **PDF Service** - pdf.co, htmlpdfapi.com, or similar

---

## Session Notes

### Session 3 - 2026-01-18 (continued)
**Focus:** BOL template, Invoice template, Make.com architecture
**Completed:**
- BOL HTML template (black/white, print-optimized)
- Invoice HTML template (full detail, Net 30)
- Conditional pickup vs delivery logic in BOL
- Complete Make.com scenario specifications
- Claude parsing prompt design
- Email templates for vendor/customer notifications
- Full inbound order flow documented

**Files Created/Updated:**
- bol-template.html (with Handlebars placeholders)
- invoice-template.html (with Handlebars placeholders)
- PALLET_SOLUTIONS_AUTOMATION_PROJECT.md (Make.com specs added)

**Next Steps:**
1. Update Airtable status fields (prompts provided earlier)
2. Create Make.com account and connect Outlook
3. Get Claude API key
4. Build Scenario 1: Inbound Order Processing
5. Build Scenario 2: Vendor Confirmation Handler
6. Test with sample emails

---

## Time Investment

| Session | Date | Focus | Approx Hours |
|---------|------|-------|--------------|
| 1 | 2026-01-18 | Architecture, escalation design | ~2 hrs |
| 2 | 2026-01-18 | All 12 Airtable tables | ~3 hrs |
| 3 | 2026-01-18 | Templates, Make.com specs | ~3 hrs |
| **Total** | | | **~8 hours** |
