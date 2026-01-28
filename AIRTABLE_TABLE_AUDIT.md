# Pallet Solutions - Airtable Table Audit

## Overview
This document provides a comprehensive audit of all tables in the Pallet Solutions Airtable base, identifying redundancies, relationships, and recommendations for cleanup before building the Make.com automation.

---

## CRITICAL REDUNDANCIES FOUND

### 1. DUPLICATE CUSTOMER TABLES
| Table | Records | Status | Recommendation |
|-------|---------|--------|----------------|
| **Customer** (singular) | 1 (Maytex) | ACTIVE - Has linked records | **KEEP - This is the primary table** |
| **Customers** (plural) | 1 (Prospect) | UNUSED - No linked records | **DELETE or HIDE** |

**Issue:** Two customer tables exist. "Customer" is actively used with linked Contacts, Locations, Vendors, Orders. "Customers" appears to be an abandoned duplicate.

### 2. DUPLICATE LOCATION TABLES
| Table | Records | Status | Recommendation |
|-------|---------|--------|----------------|
| **Locations** | 2 (Lancaster PA, New Castle DE) | ACTIVE - Has linked records | **KEEP - This is the primary table** |
| **Facilities** | 1 (Inactive) | UNUSED - Empty data | **DELETE or HIDE** |

**Issue:** "Locations" has actual location data with linked Orders, Pricing, Contacts. "Facilities" is an abandoned duplicate with no useful data.

### 3. DUPLICATE CONTACT TABLES
| Table | Records | Status | Recommendation |
|-------|---------|--------|----------------|
| **Contact** | 10 records | ACTIVE - Has linked Communications, Orders, Locations | **KEEP - This is the primary table** |
| **Contacts** (plural) | 1 record | UNUSED - Minimal data, linked to Facilities | **DELETE or HIDE** |

**Issue:** "Contact" is the working table with actual contact data. "Contacts" is linked to the unused "Facilities" table.

### 4. POTENTIAL PRICING REDUNDANCY
| Table | Purpose | Recommendation |
|-------|---------|----------------|
| **PRICING** | Location + Vendor + Product pricing | Review if needed |
| **LOCATION REQUIREMENTS** | Location-specific product requirements with pricing | **PRIMARY - Keep this** |

**Issue:** Both tables store pricing info (Our Cost, Our Price). LOCATION REQUIREMENTS appears to be the more complete table with Grade, Spec, Dimensions, and vendor linkage. PRICING table may be redundant or could serve a different purpose (e.g., historical pricing).

---

## ACTIVE TABLES TO KEEP

### Core Entity Tables

#### 1. Customer (KEEP)
- **Records:** 1
- **Fields:** Customer Name, Billing Address, Payment Terms, Auto-Approve Orders, Status, Onboarded Date, Notes
- **Links:** Contact, Locations, Vendors, Location Requirements, Orders
- **Purpose:** Master customer record

#### 2. Contact (KEEP)
- **Records:** 10
- **Fields:** Name, Phone, Customer, Role, Nickname, Notes, Customer 2, Primary Location
- **Links:** Communications, Orders
- **Purpose:** Customer contacts for communications and orders
- **Note:** Has "Customer 2" field - may need cleanup

#### 3. Locations (KEEP)
- **Records:** 2
- **Fields:** Location Name, Dock Info, Default Volume, Default Unit, Notes, Location Status, Location Type, Required Capabilities
- **Links:** Location Requirements, Orders, Pricing, Contact, Communications
- **Purpose:** Delivery locations for customers

#### 4. Vendors (KEEP)
- **Records:** 1
- **Fields:** Vendor Name, Status, Address, City, State, Zip, Primary Contact, Primary Email, Primary Phone, Payment Terms, Lead Time Days, Products Offered
- **Purpose:** Pallet suppliers

### Product & Pricing Tables

#### 5. PRODUCTS (KEEP)
- **Records:** 1
- **Fields:** Product Name, Product Code, Grade, Spec, Dimensions, Type, Default Unit, Description, Notes, Active, Date Added, Date Last Updated
- **Purpose:** Master product catalog

#### 6. Line Item Types (KEEP)
- **Records:** 26
- **Fields:** Display Name, Category, Dimension, Finish Type, Grade, Heat Treated, Default Billing Type, Short Code, Is Active, Sort Order
- **Links:** Delivery Line Items, Order Line Items
- **Purpose:** Standardized product types for orders/deliveries

#### 7. LOCATION REQUIREMENTS (KEEP)
- **Records:** 3
- **Fields:** ID, Grade, Spec, Dimensions, Default Volume, Unit, Is Primary, Our Cost, Our Price, Notes
- **Links:** Vendor, Customer
- **Purpose:** Location-specific product requirements with pricing

#### 8. PRICING (REVIEW)
- **Records:** 1
- **Fields:** Id, Location, Vendor, Product, Our Cost, Our Price, Unit, Effective Date, Expires, Notes, Is Active, Price Difference
- **Purpose:** May be redundant with Location Requirements - review if needed

### Communication & Workflow Tables

#### 9. COMMUNICATIONS (KEEP)
- **Records:** 14
- **Fields:** Comm ID, Date, Direction, Channel, From, To, Subject, Body, Parsed, AI Summary, AI Extracted Data, Attachments, Notes, Location, Classification, Date Received, Processed
- **Links:** Contact, Customer, Related Order, Related Escalation
- **Purpose:** Email log for all customer communications
- **Status:** Updated with Classification field for Make.com routing

#### 10. Escalations (KEEP)
- **Records:** 1
- **Fields:** Escalation ID, Type, Priority, Status, Subject, Email From, Email Subject, Email Body, Email Received, Original Email, Parse Attempt, Confidence Score
- **Purpose:** Track issues that couldn't be auto-processed

### Order Processing Tables

#### 11. Orders (KEEP)
- **Records:** 1
- **Fields:** Order Number, Customer PO, Reference Number, Order Source, Placed By Contact, Parse Confidence, Auto Processed, Special Instructions, Assigned Vendor, Vendor Confirmed, Vendor Confirmed Date, Created Date, Last Modified, Days Until Due, Is Overdue, Days Overdue
- **Links:** Order Line Items, Escalations, Customer Invoices
- **Purpose:** Customer orders

#### 12. Order Line Items (KEEP)
- **Records:** 1
- **Fields:** Line ID, Order, Line Item Type, Description, Category, Qty Ordered, Qty Shipped, Qty Backorder, Unit Price, Line Total, Vendor, Notes
- **Purpose:** Individual line items on orders

### Delivery Tables

#### 13. Deliveries (KEEP)
- **Records:** 1
- **Fields:** Delivery ID, Number, Driver Name, Notes, Released By, Received By, Date Signed, POD Attachment, POD Status
- **Links:** Delivery Line Items, Customer Invoices, Vendor, Order
- **Purpose:** Track actual deliveries

#### 14. Delivery Line Items (KEEP)
- **Records:** 1
- **Fields:** Line ID, Delivery, Line Item Type, Description, Category, Default Billing, Expected Qty, Loaded Qty, Qty Variance, Billing Type, Unit Price, Line Total
- **Purpose:** Individual items on deliveries

### Invoice Tables

#### 15. Customer Invoices (KEEP)
- **Records:** 1
- **Fields:** Invoice Number, Payment Terms, Sent Date, Paid Date, Payment Method, Payment Reference, Invoice PDF, Notes, Created Date, Days Overdue, Is Overdue
- **Purpose:** Invoices sent to customers

#### 16. Vendor Invoices (KEEP)
- **Records:** 1
- **Fields:** Vendor Invoice Number, Vendor, Status, Invoice Date, Due Date, Amount, Order Line Items, Paid Date, Payment Method, Payment Reference, Invoice Document, Notes
- **Purpose:** Invoices received from vendors

---

## TABLES TO DELETE/HIDE

| Table | Reason | Action |
|-------|--------|--------|
| **Customers** (plural) | Duplicate of Customer, no active links | DELETE or HIDE |
| **Facilities** | Duplicate of Locations, no active links | DELETE or HIDE |
| **Contacts** (plural) | Duplicate of Contact, linked to unused Facilities | DELETE or HIDE |

---

## RELATIONSHIP MAP

```
Customer (1)
    ├── Contact (many)
    │       └── Communications (many)
    │       └── Orders (many) - Placed By Contact
    ├── Locations (many)
    │       ├── Location Requirements (many)
    │       ├── Pricing (many)
    │       └── Communications (many)
    ├── Vendors (many)
    └── Orders (many)
            ├── Order Line Items (many)
            │       └── Line Item Types (1)
            ├── Escalations (many)
            └── Customer Invoices (many)

Deliveries
    ├── Delivery Line Items (many)
    │       └── Line Item Types (1)
    ├── Customer Invoices (1)
    ├── Vendor (1)
    └── Order (1)

Vendor Invoices
    ├── Vendor (1)
    └── Order Line Items (many)
```

---

## RECOMMENDED ACTIONS BEFORE MAKE.COM AUTOMATION

### Immediate Actions:
1. **DELETE or HIDE** the following duplicate tables:
   - Customers (plural)
   - Facilities
   - Contacts (plural)

2. **Review PRICING table** - determine if it's needed or if LOCATION REQUIREMENTS covers all pricing needs

3. **Clean up Contact table** - remove "Customer 2" field if not needed

### Fields Already Added for Automation:
The COMMUNICATIONS table has been updated with:
- Classification (Single Select: ORDER, ACCOUNTING, QUESTION, GENERAL, UNCLEAR)
- Date Received
- Processed (Checkbox)
- Related Escalation (Link)

---

## TABLE COUNT SUMMARY

| Category | Active Tables | Duplicate Tables |
|----------|---------------|------------------|
| Core Entities | 4 (Customer, Contact, Locations, Vendors) | 3 (Customers, Contacts, Facilities) |
| Products/Pricing | 4 (Products, Line Item Types, Location Requirements, Pricing) | 0 |
| Communications | 2 (Communications, Escalations) | 0 |
| Orders | 2 (Orders, Order Line Items) | 0 |
| Deliveries | 2 (Deliveries, Delivery Line Items) | 0 |
| Invoices | 2 (Customer Invoices, Vendor Invoices) | 0 |
| **TOTAL** | **16 Active** | **3 Duplicates to Remove** |

---

## NEXT STEPS

1. Clean up duplicate tables (delete or hide)
2. Verify all relationships are correct
3. Build Make.com Scenario 1 using the proper flow from MAKE_SCENARIO_1_PROPER_FLOW.md
4. Test with sample emails before going live

---

*Document created: January 19, 2026*
*For: Pallet Solutions Order-to-Cash Automation Project*
