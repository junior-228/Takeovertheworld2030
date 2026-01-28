# Pallet Solutions Operations - Airtable Schema
## Updated: January 24, 2026

---

## CUSTOMER TABLE

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Customer Name | Text | Primary field |
| Status | Single Select | Active, Inactive |
| Customer Code | Text | |
| Entity Type | Single Select | Vendor, Customer, etc. |
| Primary Contact | Text | |
| Billing Email | Email | |
| Billing Address | Text | |
| Company Phone | Phone | |
| Tax ID | Text | |
| Credit Limit | Currency | |
| Account On Hold? | Checkbox | |
| Requires Upfront Payment | Checkbox | |
| Requires PO # | Checkbox | |
| Payment Terms | Single Select | Net 45, Net 30, etc. |
| Auto-Approve Orders | Checkbox | Maytex = checked |
| Onboarded Date | Date | |
| Notes | Long text | |
| Contact | Link to Contact | Links to Contact table |
| Locations | Link to Locations | Links to Locations table |
| ORDERS | Link to Orders | Links to Orders table |
| COMMUNICATIONS | Link to Communications | |
| PRICING | Link to Pricing | |
| Escalations | Link to Escalations | |
| Requires POD Upload | Checkbox | |
| Requires Invoice | Checkbox | |
| Apply Tax | Checkbox | |
| Email Domains | Text | |
| **Account Type** | **Single Select** | **NEW: Direct, Brokered** |

### Current Data:
- **Maytex**: Status=Active, Payment Terms=Net 45, Auto-Approve Orders=checked, **Account Type=Direct**

---

## LOCATIONS TABLE

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Location Name | Text | Primary field |
| Customer | Link to Customer | |
| Address | Text | |
| City | Text | |
| State | Text | |
| Zip | Text | |
| **Assigned Vendor** | **Link to Vendors** | **NEW** |
| **Backup Vendor** | **Link to Vendors** | **NEW** |
| **Service Type** | **Single Select** | **NEW: Delivery, Pickup, Both** |
| Lat/Long | Text | |
| Vendor Name (from Assigned Vendor) | Lookup | Auto-populated |
| Vendor Name (from Backup Vendor) | Lookup | Auto-populated |
| Drop Trailer Required | Checkbox | |
| Receiving Hours | Text | |
| Dock Info | Text | |
| Default Volume | Number | |
| Default Unit | Single Select | |
| Notes | Long text | |
| Location Status | Single Select | |
| Location Type | Single Select | |
| Required Capabilities | Multiple Select | |
| LOCATION REQUIREMENTS | Link to Location Requirements | |
| ORDERS | Link to Orders | |
| Contact | Link to Contact | |
| Is Active | Checkbox | |
| Appointment Required | Checkbox | |
| Delivery Instructions | Long text | |
| Aliases | Text | |
| Orders (Pickup Location) | Link to Orders | |
| Orders (Delivery Location) | Link to Orders | |

### Current Data:
- **Lancaster PA**: Linked to Maytex
- **New Castle DE**: Linked to Maytex

### TODO:
- [ ] Set Assigned Vendor = Fairfield Pallet for both locations
- [ ] Set Service Type for each location

---

## VENDORS TABLE

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Vendor Name | Text | Primary field |
| Status | Single Select | Backup, Primary, etc. |
| Address | Text | |
| City | Text | |
| State | Text | |
| Zip | Text | |
| Primary Contact | Text | |
| Primary Email | Email | |
| Primary Phone | Phone | |
| Payment Terms | Single Select | COD, Net 30, etc. |

### Current Data:
- **Pallet Master**: Status=Backup
- **Fairfield Pallet**: (needs to be filled in)

### TODO:
- [ ] Fill in Fairfield Pallet details (Name, Address, Email, Contact, Phone)

---

## ORDERS TABLE

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Order Number | Autonumber | Primary field |
| Status | Single Select | |
| COMMUNICATIONS | Link to Communications | |
| **BOL PDF** | **Attachment** | **NEW** |
| **Vendor Confirmation URL** | **URL** | **NEW** |
| **Customer Notified** | **Checkbox** | **NEW** |
| **Customer Notified Date** | **Date** | **NEW** |
| **Pickup Location** | **Link to Locations** | **NEW** |
| **Delivery Location** | **Link to Locations** | **NEW** |
| Assigned Vendor | Link to Vendors | Existing |
| Vendor Confirmed | Checkbox | Existing |
| Deliveries | Link to Deliveries | |
| Customer | Link to Customer | |

### Current Data:
- 2 orders exist

---

## DELIVERIES TABLE

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Delivery ID | Autonumber | Primary field |
| Customer Invoices | Link to Customer Invoices | |
| Vendor | Link to Vendors | |
| Order | Link to Orders | |
| Days Since Delivery | Formula | |
| POD Overdue | Formula/Checkbox | |
| Needs POD | Checkbox | |
| Customer Invoices 2 | Link | |
| Scheduled Date | Date | |
| Actual Delivery Date | Date | |
| Delivery Status | Single Select | |
| Message ID | Text | |
| Thread ID | Text | |
| CC | Text | |
| **Driver Phone** | **Phone** | **EXISTING - Verified** |
| **Signed POD** | **Attachment** | **EXISTING - Verified** |
| **Delivery Notes** | **Long text** | **EXISTING - Verified** |
| **Pickup Time** | **Time** | **EXISTING - Verified** |
| **Delivered At** | **Date with time** | **EXISTING - Verified** |
| **Driver Name** | **Text** | **EXISTING - Verified** |

### Current Data:
- 2 delivery records exist

---

## SCHEMA CHANGES SUMMARY

### Completed Changes:

#### Customer Table:
- [x] Added "Account Type" field (Single Select: Direct, Brokered)
- [x] Set Maytex = Direct

#### Locations Table:
- [x] Added "Service Type" field (Single Select: Delivery, Pickup, Both)
- [x] Added "Assigned Vendor" field (Link to Vendors)
- [x] Added "Backup Vendor" field (Link to Vendors)
- [x] Added lookup fields for vendor names

#### Orders Table:
- [x] Added "Pickup Location" field (Link to Locations)
- [x] Added "Delivery Location" field (Link to Locations)
- [x] Added "BOL PDF" field (Attachment)
- [x] Added "Vendor Confirmation URL" field (URL)
- [x] Added "Customer Notified" field (Checkbox)
- [x] Added "Customer Notified Date" field (Date)

#### Deliveries Table:
- [x] Verified existing fields: Driver Name, Driver Phone, Signed POD, Delivery Notes, Pickup Time, Delivered At

### Pending Manual Tasks:

1. **Vendors Table**: Fill in Fairfield Pallet details
   - Vendor Name
   - Address
   - Primary Contact
   - Primary Email
   - Primary Phone

2. **Locations Table**: Link vendors to locations
   - Lancaster PA → Assigned Vendor = Fairfield Pallet
   - New Castle DE → Assigned Vendor = Fairfield Pallet
   - Set Service Type for each location

---

## AUTOMATION WORKFLOW STATUS

The Airtable schema is now ready for the Make.com automation workflow described in `Operations_Automation_Workflow.md`.

### Next Steps:
1. Fill in Fairfield vendor details
2. Link locations to assigned vendor
3. Build Make.com scenarios per the workflow document
4. Test with Maytex direct deliveries first

---

*Schema audited: January 24, 2026*
