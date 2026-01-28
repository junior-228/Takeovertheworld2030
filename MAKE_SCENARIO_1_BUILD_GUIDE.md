# Make.com Scenario 1: Inbound Email Processing - Build Guide

## Overview
This scenario handles ALL inbound emails:
1. Logs every email to Communications table
2. Identifies sender (known contact vs unknown)
3. Sends to Claude AI for classification
4. Routes based on classification: ORDER, ACCOUNTING, QUESTION, GENERAL, UNCLEAR

---

## SCENARIO FLOW DIAGRAM

```
[1. Outlook Watch Emails]
         ↓
[2. Airtable: Search Contact by Email]
         ↓
[3. Airtable: Create Communication Record] ← ALL emails logged here
         ↓
[4. Router: Known vs Unknown Sender]
         ↓
    ┌────────────────┬────────────────┐
    ↓                ↓                ↓
[Path 1]         [Path 2]        [Path 3]
Unknown          Known but        Known &
Sender           Can't Order      Can Order
    ↓                ↓                ↓
[5. Update      [6. Update      [7. Get Customer]
Comm:           Comm:                ↓
UNCLEAR]        QUESTION]       [8. Get Location]
    ↓                ↓                ↓
  END              END          [9. Search Location Requirements]
                                     ↓
                                [10. Text Aggregator: Build Context]
                                     ↓
                                [11. HTTP: Claude API]
                                     ↓
                                [12. JSON Parse Response]
                                     ↓
                                [13. Update Communication with Classification]
                                     ↓
                                [14. Router: By Classification]
                                     ↓
         ┌──────────┬──────────┬──────────┬──────────┐
         ↓          ↓          ↓          ↓          ↓
      ORDER    ACCOUNTING  QUESTION   GENERAL    UNCLEAR
         ↓          ↓          ↓          ↓          ↓
    [15-20]    [21-22]    [23-24]   [25-26]    [27-28]
    Create     Update     Update    Update     Create
    Order      Comm       Comm      Comm       Escalation
    Flow       Flag       Flag      Flag
```

---

## MODULE-BY-MODULE BUILD INSTRUCTIONS

### MODULE 1: Microsoft 365 Email (Outlook) - Watch Emails

**Action:** Watch Emails

**Settings:**
- Connection: Your Outlook connection
- Folder: Inbox (or specific folder for orders)
- Criteria: All emails (or filter by specific criteria)
- Mark as Read: Yes
- Maximum number of results: 10

**Output provides:**
- `{{1.subject}}`
- `{{1.body.content}}` or `{{1.textBody}}`
- `{{1.from.emailAddress.address}}`
- `{{1.from.emailAddress.name}}`
- `{{1.receivedDateTime}}`
- `{{1.id}}`

---

### MODULE 2: Airtable - Search Records (Find Contact)

**Action:** Search Records

**Settings:**
- Base: Pallet Solutions Operations
- Table: Contact
- Formula: `{Communication...} = "{{1.from.emailAddress.address}}"`
  - OR use field name for email: `FIND("{{1.from.emailAddress.address}}", {Communication...})`

**Note:** You may need to check what field stores contact email. It might be "Communication..." or a dedicated Email field.

**Output provides:**
- `{{2.id}}` - Contact record ID (if found)
- `{{2.Customer}}` - Linked customer
- `{{2.Name}}` - Contact name
- Empty array if no match

---

### MODULE 3: Airtable - Create Record (Log Communication)

**Action:** Create Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Fields:
  | Field | Value |
  |-------|-------|
  | Direction | `Inbound` |
  | Channel | `Email` |
  | Date | `{{1.receivedDateTime}}` |
  | Date Received | `{{1.receivedDateTime}}` |
  | From | `{{1.from.emailAddress.address}}` |
  | To | `{{1.toRecipients[].emailAddress.address}}` or your email |
  | Subject | `{{1.subject}}` |
  | Body | `{{1.textBody}}` or `{{1.body.content}}` |
  | Contact | `{{2.id}}` (if found, otherwise leave empty) |
  | Customer | `{{2.Customer}}` (if found) |
  | Processed | `false` (unchecked) |

**Output provides:**
- `{{3.id}}` - New Communication record ID

---

### MODULE 4: Router - Known vs Unknown Sender

**Add Router after Module 3**

**Route 1: Unknown Sender**
- Label: `Unknown Sender`
- Filter: `{{length(2)}} = 0` (Contact search returned no results)

**Route 2: Known - Can't Place Orders**
- Label: `Known - No Order Permission`
- Filter: `{{length(2)}} > 0` AND Contact doesn't have order permission
- (Check if Contact has "Can Place Orders" field or similar)

**Route 3: Known - Can Place Orders**
- Label: `Known - Can Order`
- Filter: `{{length(2)}} > 0` (Contact found)
- This is the main processing path

---

### MODULE 5: Update Communication - Unknown Sender (Route 1)

**Action:** Update Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Record ID: `{{3.id}}`
- Fields:
  | Field | Value |
  |-------|-------|
  | Classification | `UNCLEAR` |
  | Processed | `true` |
  | Notes | `Unknown sender - no matching contact found` |

**Then connect to Module 27 (Create Escalation) or END**

---

### MODULE 6: Update Communication - No Order Permission (Route 2)

**Action:** Update Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Record ID: `{{3.id}}`
- Fields:
  | Field | Value |
  |-------|-------|
  | Classification | `QUESTION` |
  | Processed | `true` |
  | Notes | `Contact cannot place orders - treated as question` |

**END of this route**

---

### MODULE 7: Airtable - Get Customer Record (Route 3)

**Action:** Get Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: Customer
- Record ID: `{{2.Customer.0.id}}` (first linked customer from contact)

**Output provides:**
- `{{7.id}}` - Customer ID
- `{{7.Customer Name}}`
- `{{7.Locations}}` - Linked locations
- `{{7.Payment Terms}}`
- `{{7.Auto-Approve Orders}}`

---

### MODULE 8: Airtable - Search Locations for Customer

**Action:** Search Records

**Settings:**
- Base: Pallet Solutions Operations
- Table: Locations
- Formula: `FIND("{{7.id}}", ARRAYJOIN({Customer})) > 0`

**OR if Locations are already linked in Customer record, use Get Record on the linked Locations**

**Output provides:**
- Array of location records with names, addresses, etc.

---

### MODULE 9: Airtable - Search Location Requirements

**Action:** Search Records

**Settings:**
- Base: Pallet Solutions Operations
- Table: LOCATION REQUIREMENTS
- Formula: `{Customer} = "{{7.Customer Name}}"`

**Output provides:**
- All product requirements for this customer's locations
- Includes: Grade, Spec, Dimensions, Our Cost, Our Price, Service, Method

---

### MODULE 10: Tools - Text Aggregator (Build Context for Claude)

**Action:** Text Aggregator

**Settings:**
- Source Module: Module 9 (Location Requirements)
- Row separator: `\n`
- Text:
```
Location: {{9.ID}} | Grade: {{9.Grade}} | Spec: {{9.Spec}} | Dimensions: {{9.Dimensions}} | Service: {{9.Service}} | Method: {{9.Method}} | Price: ${{9.`Our Price`}}
```

**Output provides:**
- `{{10.text}}` - Aggregated text of all location requirements

---

### MODULE 11: HTTP - Make a Request (Claude API)

**Action:** Make a request

**Settings:**
- URL: `https://api.anthropic.com/v1/messages`
- Method: `POST`
- Headers:
  | Key | Value |
  |-----|-------|
  | x-api-key | `your-claude-api-key` |
  | anthropic-version | `2023-06-01` |
  | Content-Type | `application/json` |

- Body type: Raw
- Content type: JSON (application/json)
- Request content:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "You are an order processing assistant for Pallet Solutions, a pallet supply company.\n\nCUSTOMER: {{7.Customer Name}}\nCONTACT: {{2.Name}}\n\nAVAILABLE PRODUCTS FOR THIS CUSTOMER:\n{{10.text}}\n\nEMAIL SUBJECT: {{1.subject}}\n\nEMAIL BODY:\n{{1.textBody}}\n\n---\n\nAnalyze this email and respond with ONLY valid JSON (no markdown, no explanation):\n\n{\n  \"classification\": \"ORDER\" | \"ACCOUNTING\" | \"QUESTION\" | \"GENERAL\" | \"UNCLEAR\",\n  \"confidence\": 0.0-1.0,\n  \"reasoning\": \"brief explanation\",\n  \"line_items\": [\n    {\n      \"location\": \"location name from email\",\n      \"product_match\": \"matching product ID from available products\",\n      \"quantity\": number,\n      \"service_type\": \"Delivery\" | \"Pickup\",\n      \"method\": \"Drop Trailer\" | \"Live Unload\" | \"Live Load\" | \"Swap\" | null\n    }\n  ],\n  \"requested_date\": \"YYYY-MM-DD or null\",\n  \"special_instructions\": \"any special notes from email\",\n  \"questions\": [\"list of questions if classification is QUESTION\"],\n  \"accounting_type\": \"INVOICE_QUESTION\" | \"PAYMENT_INFO\" | \"CREDIT_REQUEST\" | null\n}"
    }
  ]
}
```

**Output provides:**
- `{{11.data}}` - Full response
- `{{11.data.content[0].text}}` - Claude's JSON response

---

### MODULE 12: JSON - Parse Response

**Action:** Parse JSON

**Settings:**
- JSON String: `{{11.data.content[0].text}}`

**Create Data Structure named "Claude Email Response":**
```json
{
  "classification": "string",
  "confidence": "number",
  "reasoning": "string",
  "line_items": [
    {
      "location": "string",
      "product_match": "string",
      "quantity": "number",
      "service_type": "string",
      "method": "string"
    }
  ],
  "requested_date": "string",
  "special_instructions": "string",
  "questions": ["string"],
  "accounting_type": "string"
}
```

**Output provides:**
- `{{12.classification}}`
- `{{12.confidence}}`
- `{{12.line_items}}`
- `{{12.requested_date}}`
- etc.

---

### MODULE 13: Airtable - Update Communication with Classification

**Action:** Update Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Record ID: `{{3.id}}`
- Fields:
  | Field | Value |
  |-------|-------|
  | Classification | `{{12.classification}}` |
  | AI Summary | `{{12.reasoning}}` |
  | AI Extracted Data | `{{11.data.content[0].text}}` |
  | Processed | `true` |

---

### MODULE 14: Router - By Classification

**Add Router after Module 13**

**Route 1: ORDER**
- Label: `ORDER`
- Filter: `{{12.classification}} = ORDER`

**Route 2: ACCOUNTING**
- Label: `ACCOUNTING`
- Filter: `{{12.classification}} = ACCOUNTING`

**Route 3: QUESTION**
- Label: `QUESTION`
- Filter: `{{12.classification}} = QUESTION`

**Route 4: GENERAL**
- Label: `GENERAL`
- Filter: `{{12.classification}} = GENERAL`

**Route 5: UNCLEAR**
- Label: `UNCLEAR`
- Filter: `{{12.classification}} = UNCLEAR`

---

## ORDER PATH (Modules 15-20)

### MODULE 15: Airtable - Create Order

**Action:** Create Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: Orders
- Fields:
  | Field | Value |
  |-------|-------|
  | Customer | `{{7.id}}` |
  | Facility | (lookup from location name in line_items) |
  | Status | `Open` |
  | Order Source | `Email` |
  | Placed By Contact | `{{2.id}}` |
  | Requested Date | `{{12.requested_date}}` |
  | Special Instructions | `{{12.special_instructions}}` |
  | Parse Confidence | `{{12.confidence}}` |
  | Auto Processed | `true` |

**Output provides:**
- `{{15.id}}` - New Order ID

---

### MODULE 16: Iterator - Line Items

**Action:** Iterator

**Settings:**
- Array: `{{12.line_items}}`

**Output provides:**
- `{{16.location}}`
- `{{16.product_match}}`
- `{{16.quantity}}`
- `{{16.service_type}}`
- `{{16.method}}`

---

### MODULE 17: Airtable - Search Location Requirements (Get Pricing)

**Action:** Search Records

**Settings:**
- Base: Pallet Solutions Operations
- Table: LOCATION REQUIREMENTS
- Formula: `{ID} = "{{16.product_match}}"`

**Output provides:**
- `{{17.Our Price}}`
- `{{17.Line Item Type}}`
- `{{17.Vendor}}`

---

### MODULE 18: Airtable - Create Order Line Item

**Action:** Create Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: Order Line Items
- Fields:
  | Field | Value |
  |-------|-------|
  | Order | `{{15.id}}` |
  | Line Item Type | `{{17.Line Item Type}}` |
  | Description | `{{16.product_match}}` |
  | Qty Ordered | `{{16.quantity}}` |
  | Unit Price | `{{17.Our Price}}` |

---

### MODULE 19: Airtable - Update Communication with Order Link

**Action:** Update Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Record ID: `{{3.id}}`
- Fields:
  | Field | Value |
  |-------|-------|
  | Related Order | `{{15.id}}` |

---

### MODULE 20: Airtable - Search Vendors & Assign (Optional)

**Action:** Search Records + Update Order

If you want to auto-assign vendors based on location requirements.

---

## ACCOUNTING PATH (Modules 21-22)

### MODULE 21: Airtable - Update Communication

**Action:** Update Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Record ID: `{{3.id}}`
- Fields:
  | Field | Value |
  |-------|-------|
  | Notes | `Accounting inquiry: {{12.accounting_type}}` |

**END - or send notification**

---

## QUESTION PATH (Modules 23-24)

### MODULE 23: Airtable - Update Communication

**Action:** Update Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Record ID: `{{3.id}}`
- Fields:
  | Field | Value |
  |-------|-------|
  | Notes | `Questions: {{12.questions}}` |

**END - or send notification**

---

## GENERAL PATH (Modules 25-26)

### MODULE 25: Airtable - Update Communication

Just logs as general communication. No further action needed.

**END**

---

## UNCLEAR PATH (Modules 27-28)

### MODULE 27: Airtable - Create Escalation

**Action:** Create Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: Escalations
- Fields:
  | Field | Value |
  |-------|-------|
  | Escalation Type | `Parse Failed` |
  | Priority | `Medium` |
  | Status | `Open` |
  | Subject | `Could not process email: {{1.subject}}` |
  | Email From | `{{1.from.emailAddress.address}}` |
  | Email Subject | `{{1.subject}}` |
  | Email Body | `{{1.textBody}}` |
  | Email Received | `{{1.receivedDateTime}}` |
  | Customer | `{{7.id}}` (if known) |
  | Related Communication | `{{3.id}}` |
  | Confidence Score | `{{12.confidence}}` |

---

### MODULE 28: Airtable - Update Communication with Escalation Link

**Action:** Update Record

**Settings:**
- Base: Pallet Solutions Operations
- Table: COMMUNICATIONS
- Record ID: `{{3.id}}`
- Fields:
  | Field | Value |
  |-------|-------|
  | Related Escalation | `{{27.id}}` |

---

## BUILD ORDER CHECKLIST

| Step | Module | Status |
|------|--------|--------|
| 1 | Outlook Watch Emails | ⬜ |
| 2 | Airtable Search Contact | ⬜ |
| 3 | Airtable Create Communication | ⬜ |
| 4 | Router: Known vs Unknown | ⬜ |
| 5 | Route 1: Update Comm (Unknown) | ⬜ |
| 6 | Route 2: Update Comm (No Permission) | ⬜ |
| 7 | Route 3: Get Customer | ⬜ |
| 8 | Get/Search Locations | ⬜ |
| 9 | Search Location Requirements | ⬜ |
| 10 | Text Aggregator | ⬜ |
| 11 | HTTP Claude API | ⬜ |
| 12 | JSON Parse | ⬜ |
| 13 | Update Comm with Classification | ⬜ |
| 14 | Router: By Classification | ⬜ |
| 15 | ORDER: Create Order | ⬜ |
| 16 | ORDER: Iterator Line Items | ⬜ |
| 17 | ORDER: Search Location Req (Pricing) | ⬜ |
| 18 | ORDER: Create Order Line Item | ⬜ |
| 19 | ORDER: Update Comm with Order Link | ⬜ |
| 20 | ORDER: Assign Vendor (Optional) | ⬜ |
| 21-22 | ACCOUNTING Path | ⬜ |
| 23-24 | QUESTION Path | ⬜ |
| 25-26 | GENERAL Path | ⬜ |
| 27-28 | UNCLEAR Path (Escalation) | ⬜ |

---

## TESTING PLAN

### Test 1: Unknown Sender
Send email from unknown address → Should create Communication with UNCLEAR classification

### Test 2: Known Contact - Order
Send email: "Need 500 B grade pallets for Lancaster next Tuesday"
→ Should create Communication → Classify as ORDER → Create Order with Line Items

### Test 3: Known Contact - Accounting
Send email: "When will we receive the invoice for last week's delivery?"
→ Should classify as ACCOUNTING

### Test 4: Known Contact - Question
Send email: "Do you carry 42x42 pallets?"
→ Should classify as QUESTION

---

*Document created: January 19, 2026*
*Ready to build step-by-step*
