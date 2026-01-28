# Make.com Scenario 1: Inbound Email Processing (PROPER FLOW)

## Overview
This is the CORRECT flow where ALL emails get logged first, THEN routed based on classification.

---

## Complete Flow Diagram

```
                              INCOMING EMAIL
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  1. Outlook: Watch Emails     │
                    │     (Trigger)                 │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  2. Airtable: Search Contacts │
                    │     by sender email           │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  3. Airtable: Create Record   │
                    │     (Communications Log)      │
                    │     ** LOG ALL EMAILS **      │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  4. Router: Known Contact?    │
                    └───────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │ UNKNOWN       │       │ CAN'T PLACE   │       │ CAN PLACE     │
    │ SENDER        │       │ ORDERS        │       │ ORDERS        │
    │               │       │               │       │               │
    │ No match in   │       │ Contact found │       │ Contact found │
    │ Contacts      │       │ but Can Place │       │ Can Place     │
    │               │       │ Orders = NO   │       │ Orders = YES  │
    └───────────────┘       └───────────────┘       └───────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │ 5. Create     │       │ 6. Create     │       │ 7. Get        │
    │ Escalation    │       │ Escalation    │       │ Facility      │
    │ (Unknown      │       │ (Unauthorized │       │               │
    │  Sender)      │       │  Contact)     │       │               │
    └───────────────┘       └───────────────┘       └───────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
          STOP                    STOP              ┌───────────────┐
                                                    │ 8. Get        │
                                                    │ Customer      │
                                                    └───────────────┘
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │ 9. Search     │
                                                    │ Line Item     │
                                                    │ Types         │
                                                    └───────────────┘
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │ 10. Text      │
                                                    │ Aggregator    │
                                                    │ (product list)│
                                                    └───────────────┘
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │ 11. HTTP      │
                                                    │ Claude API    │
                                                    │ (Classify &   │
                                                    │  Parse Email) │
                                                    └───────────────┘
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │ 12. JSON      │
                                                    │ Parse         │
                                                    └───────────────┘
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │ 13. Router:   │
                                                    │ Classification│
                                                    └───────────────┘
                                                            │
        ┌────────────────┬──────────────┬──────────────────┼──────────────────┐
        │                │              │                  │                  │
        ▼                ▼              ▼                  ▼                  ▼
┌───────────────┐ ┌───────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ ORDER         │ │ ACCOUNTING│ │ QUESTION      │ │ GENERAL       │ │ UNCLEAR/      │
│               │ │           │ │               │ │ CONVERSATION  │ │ OTHER         │
│ classification│ │ billing,  │ │ needs human   │ │               │ │               │
│ = "ORDER"     │ │ payment,  │ │ response      │ │ just logged   │ │ can't parse   │
│               │ │ invoice   │ │               │ │ (already done)│ │               │
└───────────────┘ └───────────┘ └───────────────┘ └───────────────┘ └───────────────┘
        │                │              │                  │                  │
        ▼                ▼              ▼                  ▼                  ▼
┌───────────────┐ ┌───────────┐ ┌───────────────┐       STOP         ┌───────────────┐
│ 14. Create    │ │ 15. Create│ │ 16. Create    │    (logged only)   │ 17. Create    │
│ Order         │ │ Escalation│ │ Escalation    │                    │ Escalation    │
│               │ │ (Acctg)   │ │ (Question)    │                    │ (Unclear)     │
└───────────────┘ └───────────┘ └───────────────┘                    └───────────────┘
        │                │              │                                    │
        ▼                ▼              ▼                                    ▼
┌───────────────┐      STOP          STOP                                  STOP
│ 18. Iterator  │
│ (line items)  │
└───────────────┘
        │
        ▼
┌───────────────┐
│ 19. Create    │
│ Order Line    │
│ Items         │
└───────────────┘
        │
        ▼
┌───────────────┐
│ 20. Search    │
│ Vendors       │
└───────────────┘
        │
        ▼
┌───────────────┐
│ 21. Update    │
│ Order with    │
│ Vendor        │
└───────────────┘
        │
        ▼
┌───────────────┐
│ 22. Send      │
│ Email to      │
│ Vendor        │
└───────────────┘
        │
        ▼
      DONE
```

---

## New Table Required: Communications

You need to add a **Communications** table to Airtable to log ALL emails.

### Communications Table Fields

| Field Name | Type | Description |
|------------|------|-------------|
| Communication ID | Autonumber | COM-### |
| Date Received | Date/Time | When email came in |
| Direction | Single Select | Inbound / Outbound |
| Channel | Single Select | Email / Phone / Portal |
| From Email | Email | Sender's email |
| From Name | Text | Sender's name |
| To Email | Email | Recipient |
| Subject | Text | Email subject |
| Body | Long Text | Email body content |
| Contact | Link | → Contacts table (if matched) |
| Customer | Link | → Customers table (lookup from Contact) |
| Classification | Single Select | ORDER / ACCOUNTING / QUESTION / GENERAL / UNCLEAR |
| Related Order | Link | → Orders table (if order created) |
| Related Escalation | Link | → Escalations table (if escalation created) |
| Processed | Checkbox | Has this been handled? |
| Notes | Long Text | Any notes |

---

## Module-by-Module Configuration

### Module 1: Microsoft 365 Email (Outlook) - Watch Emails
**Type:** Trigger
**Settings:**
- Folder: Inbox
- Mark as read: Yes

---

### Module 2: Airtable - Search Records (Contacts)
**Table:** Contacts
**Formula:** `LOWER({Email}) = LOWER("{{1.from.emailAddress.address}}")`
**Output Fields:** Select All

---

### Module 3: Airtable - Create Record (Communications)
**Table:** Communications
**Fields:**
| Field | Value |
|-------|-------|
| Date Received | `{{1.receivedDateTime}}` |
| Direction | `Inbound` |
| Channel | `Email` |
| From Email | `{{1.from.emailAddress.address}}` |
| From Name | `{{1.from.emailAddress.name}}` |
| Subject | `{{1.subject}}` |
| Body | `{{1.body.content}}` |
| Contact | `{{2.id}}` (if found, otherwise empty) |
| Processed | `false` |

---

### Module 4: Router - Known Contact Check
**Route 1: Unknown Sender**
- Label: `Unknown Sender`
- Condition: `{{2.Total number of bundles}}` Equal to `0`

**Route 2: Can't Place Orders**
- Label: `Cant Place Orders`
- Condition: `{{2.Can Place Orders}}` Equal to `false`

**Route 3: Can Place Orders**
- Label: `Can Place Orders`
- Condition: `{{2.Can Place Orders}}` Equal to `true`

---

### Module 5: Airtable - Create Record (Escalation - Unknown Sender)
**Table:** Escalations
**Fields:**
| Field | Value |
|-------|-------|
| Type | `Unknown Sender` |
| Priority | `Medium` |
| Status | `Open` |
| Subject | `Unknown sender attempted contact` |
| Email From | `{{1.from.emailAddress.address}}` |
| Email Subject | `{{1.subject}}` |
| Email Body | `{{1.body.content}}` |

---

### Module 6: Airtable - Create Record (Escalation - Unauthorized)
**Table:** Escalations
**Fields:**
| Field | Value |
|-------|-------|
| Type | `Unauthorized Contact` |
| Priority | `Medium` |
| Status | `Open` |
| Subject | `Contact not authorized to place orders` |
| Email From | `{{1.from.emailAddress.address}}` |
| Email Subject | `{{1.subject}}` |
| Email Body | `{{1.body.content}}` |
| Related Contact | `{{2.id}}` |

---

### Module 7: Airtable - Get Record (Facility)
**Table:** Facilities
**Record ID:** `{{2.Facility[0]}}` (first facility linked to contact)

---

### Module 8: Airtable - Get Record (Customer)
**Table:** Customers
**Record ID:** `{{7.Customer[0]}}` (customer linked to facility)

---

### Module 9: Airtable - Search Records (Line Item Types)
**Table:** Line Item Types
**Formula:** `{Is Active} = TRUE()`
**Limit:** 100

---

### Module 10: Tools - Text Aggregator
**Source Module:** Module 9 (Line Item Types)
**Text:** `- {{9.Display Name}}`
**Row Separator:** Newline

---

### Module 11: HTTP - Make a Request (Claude API)
**URL:** `https://api.anthropic.com/v1/messages`
**Method:** POST
**Headers:**
| Name | Value |
|------|-------|
| x-api-key | `your-claude-api-key` |
| anthropic-version | `2023-06-01` |
| Content-Type | `application/json` |

**Body (JSON):**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Classify and parse this customer email.\n\nCUSTOMER INFO:\nName: {{8.Customer Name}}\nFacility: {{7.Facility Name}}\nAddress: {{7.Address}}, {{7.City}}, {{7.State}} {{7.Zip}}\n\nAVAILABLE PRODUCTS:\n{{10.text}}\n\nEMAIL SUBJECT: {{1.subject}}\n\nEMAIL BODY:\n{{1.body.content}}\n\nFirst, classify this email as one of:\n- ORDER: Customer wants to place an order for pallets\n- ACCOUNTING: Related to billing, invoices, payments\n- QUESTION: Customer has a question needing human response\n- GENERAL: General conversation, thank you notes, etc.\n- UNCLEAR: Cannot determine intent\n\nThen if it's an ORDER, extract the details.\n\nRespond with ONLY valid JSON:\n{\"classification\": \"ORDER\" or \"ACCOUNTING\" or \"QUESTION\" or \"GENERAL\" or \"UNCLEAR\", \"confidence\": 0.0-1.0, \"line_items\": [{\"product_name\": \"exact match from available products\", \"quantity\": number}], \"requested_delivery_date\": \"YYYY-MM-DD or null\", \"special_instructions\": \"any notes or null\", \"questions\": \"customer questions or null\", \"summary\": \"one sentence summary\"}"
    }
  ]
}
```

---

### Module 12: JSON - Parse JSON
**Data Structure:** Claude Email Response
**JSON String:** `{{11.data}}`

---

### Module 13: Router - Classification
**Route 1: Order**
- Condition: `{{12.classification}}` Equal to `ORDER`

**Route 2: Accounting**
- Condition: `{{12.classification}}` Equal to `ACCOUNTING`

**Route 3: Question**
- Condition: `{{12.classification}}` Equal to `QUESTION`

**Route 4: General**
- Condition: `{{12.classification}}` Equal to `GENERAL`

**Route 5: Unclear**
- Condition: `{{12.classification}}` Equal to `UNCLEAR`

---

### Module 14: Airtable - Create Record (Order)
*On ORDER route*
**Table:** Orders
**Fields:**
| Field | Value |
|-------|-------|
| Customer | `{{8.id}}` |
| Facility | `{{7.id}}` |
| Status | `Pending Vendor Confirmation` |
| Order Date | `{{formatDate(now; "YYYY-MM-DD")}}` |
| Requested Date | `{{12.requested_delivery_date}}` |
| Special Instructions | `{{12.special_instructions}}` |
| Order Source | `Email` |
| Placed By Contact | `{{2.id}}` |

---

### Module 15: Airtable - Create Record (Escalation - Accounting)
*On ACCOUNTING route*
**Table:** Escalations
**Fields:**
| Field | Value |
|-------|-------|
| Type | `Accounting` |
| Priority | `Medium` |
| Status | `Open` |
| Subject | `Accounting inquiry from {{8.Customer Name}}` |
| Email From | `{{1.from.emailAddress.address}}` |
| Email Subject | `{{1.subject}}` |
| Email Body | `{{1.body.content}}` |
| Related Contact | `{{2.id}}` |
| Related Customer | `{{8.id}}` |

---

### Module 16: Airtable - Create Record (Escalation - Question)
*On QUESTION route*
**Table:** Escalations
**Fields:**
| Field | Value |
|-------|-------|
| Type | `Customer Question` |
| Priority | `Medium` |
| Status | `Open` |
| Subject | `Question from {{8.Customer Name}}` |
| Email From | `{{1.from.emailAddress.address}}` |
| Email Subject | `{{1.subject}}` |
| Email Body | `{{1.body.content}}` |
| Related Contact | `{{2.id}}` |
| Related Customer | `{{8.id}}` |

---

### Module 17: Airtable - Create Record (Escalation - Unclear)
*On UNCLEAR route*
**Table:** Escalations
**Fields:**
| Field | Value |
|-------|-------|
| Type | `Parse Failed` |
| Priority | `High` |
| Status | `Open` |
| Subject | `Could not parse email from {{1.from.emailAddress.name}}` |
| Email From | `{{1.from.emailAddress.address}}` |
| Email Subject | `{{1.subject}}` |
| Email Body | `{{1.body.content}}` |
| Related Contact | `{{2.id}}` |

---

### Module 18: Iterator (Line Items)
*On ORDER route, after Create Order*
**Array:** `{{12.line_items}}`

---

### Module 19: Airtable - Create Record (Order Line Items)
*Inside Iterator*
**Table:** Order Line Items
**Fields:**
| Field | Value |
|-------|-------|
| Order | `{{14.id}}` |
| Line Item Type | `{{18.product_name}}` |
| Qty Ordered | `{{18.quantity}}` |

---

### Module 20: Airtable - Search Records (Vendors)
**Table:** Vendors
**Formula:** `{Is Active} = TRUE()`
**Limit:** 1

---

### Module 21: Airtable - Update Record (Order)
**Table:** Orders
**Record ID:** `{{14.id}}`
**Fields:**
| Field | Value |
|-------|-------|
| Assigned Vendor | `{{20.id}}` |

---

### Module 22: Microsoft 365 Email - Send Email (to Vendor)
**To:** `{{20.Email}}`
**Subject:** `New Order Request - {{8.Customer Name}} - Order {{14.Order Number}}`
**Body:**
```
Hello {{20.Vendor Name}},

We have a new order request:

ORDER DETAILS:
Order #: {{14.Order Number}}
Customer: {{8.Customer Name}}
Location: {{7.Address}}, {{7.City}}, {{7.State}} {{7.Zip}}
Requested Date: {{12.requested_delivery_date}}

Please reply CONFIRM to accept this order.

Thank you,
Pallet Solutions
```

---

### Module 23: Airtable - Update Record (Communications)
*At the end of each path, update the Communications record*
**Table:** Communications
**Record ID:** `{{3.id}}`
**Fields:**
| Field | Value |
|-------|-------|
| Classification | `{{12.classification}}` |
| Related Order | `{{14.id}}` (if order created) |
| Related Escalation | `{{escalation.id}}` (if escalation created) |
| Processed | `true` |

---

## Summary of Changes from Current Build

1. **ADD** Communications table to Airtable
2. **ADD** Module 3: Log ALL emails to Communications (before routing)
3. **MOVE** Claude API call AFTER contact verification, to classify email type
4. **ADD** ACCOUNTING and GENERAL routes to Router 13
5. **ADD** Module to update Communications record at end of each path

---

## Build Order

1. Create Communications table in Airtable
2. Delete current Make scenario (start fresh)
3. Build modules 1-4 (Outlook → Search Contacts → Log Email → Router)
4. Build Unknown Sender and Can't Place Orders paths (modules 5-6)
5. Build Can Place Orders path through Claude (modules 7-12)
6. Build Classification Router with all 5 routes (module 13)
7. Build ORDER path (modules 14, 18-22)
8. Build ACCOUNTING, QUESTION, UNCLEAR paths (modules 15-17)
9. Add Communications update at end of each path (module 23)
10. Test with sample emails

---

## Estimated Build Time
- Communications table: 15 minutes
- Main flow (modules 1-12): 45 minutes
- All router paths: 30 minutes
- Testing: 30 minutes
- **Total: ~2 hours**
