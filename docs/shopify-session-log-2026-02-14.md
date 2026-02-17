**TKT-5793: Shopify POS Distributor Pilot**

Session Work Log

Date: February 14, 2026 | Performed by: Howard Koziara

| Project | Shopify POS Distributor Pilot \- USA |
| :---- | :---- |
| **ClickUp Ticket** | TKT-5793 |
| **Platform** | Shopify Plus ($2,500/mo) |
| **Store Domain** | unicity-international-2.myshopify.com |
| **Due Date** | February 21, 2026 |
| **Scope** | 1 Regional Manager \+ 10 Distributors |

# **Completed Work \- February 14, 2026**

## **Ticket 1: Create US Unicity Pilot Location**

**Status: COMPLETED**

Created a dedicated POS location in Shopify Admin for the pilot territory.

| Field | Value |
| :---- | :---- |
| **Location Name** | US Unicity Pilot Location |
| **Address** | 1712 South East Bay Boulevard, Suite 101, Provo, UT 84606 |
| **Fulfill Online Orders** | OFF (POS-only location) |
| **Default Location** | No \- Shop location remains default for online/warehouse |

## **Ticket 2: Activate POS Pro on Pilot Location**

**Status: COMPLETED**

Activated POS Pro subscription on the US Unicity Pilot Location. Shopify Plus plan includes 200 POS Pro locations. This is location 1 of 200\. POS Pro enables advanced features needed for distributor management, custom roles, and sales attribution.

## **Ticket 3: Create POS Roles**

**Status: COMPLETED**

Created two custom POS roles via Point of Sale \> POS roles.

### **Sales Role (for 10 Distributors)**

| Permission | Granted |
| :---- | :---- |
| Apply discount codes | Yes |
| Manage sales attribution for orders | Yes (critical for tracking) |
| Edit customer details | Yes |
| Create new customers | Yes |
| Add custom sales | Yes |
| Cancel orders | Yes |
| Log out from POS app | Yes |
| All other permissions | No |

### **Manager Role (for Regional Manager)**

Includes all Sales role permissions plus the following additional permissions:

| Additional Permission | Granted |
| :---- | :---- |
| Ship to customer | Yes |
| Edit taxes | Yes |
| Apply custom discounts | Yes |
| Manage orders at all locations | Yes |
| Return and exchange orders (all sub-options) | Yes |
| Manage staff orders at all locations | Yes |
| Delete customers | Yes |
| Manage/redeem customer store credit | Yes |
| View analytics for device location | Yes |
| Manage payment tracking (all 4 sub-options) | Yes |
| Manage Point of Sale staff (including POS roles) | Yes |
| Customize smart grid | Yes |
| Manage receipt settings | Yes |
| Manager approval (override approvals) | Yes |

# **Storefront API Setup for Replit Frontend**

**Status: COMPLETED**

## **Context**

Colby Cook is building a custom purchase page in Replit for door-to-door sales reps. Sam Hughes approved this as a separate sales channel from POS tap-to-pay. The Replit frontend creates online checkouts through the Storefront API. It does not create POS transactions.

## **Attempt 1: Dev Dashboard Custom App (Abandoned)**

Initial approach attempted to create a custom app through the Shopify Dev Dashboard.

| Detail | Value |
| :---- | :---- |
| **Path** | Settings \> Apps \> Develop apps \> Dev Dashboard |
| **App Name Created** | KnockBase |
| **Client ID Generated** | d2c0ef567f998839295caad508319d35 |
| **Client Secret** | Generated but NOT shared (Admin API credential) |
| **Issue** | Dev Dashboard only supports Admin API scopes. Storefront API scopes (unauthenticated\_\*) are not available in this interface. |
| **Resolution** | Abandoned this approach. KnockBase app can be deleted. |

## **Attempt 2: Headless Sales Channel (Correct Approach)**

Installed the Headless channel from the Shopify App Store (free, built by Shopify). This is the official method for generating Storefront API tokens.

| Detail | Value |
| :---- | :---- |
| **Channel** | Headless (Shopify App Store, Free) |
| **Storefront Name** | Unicity International Headless |
| **Store Domain** | unicity-international-2.myshopify.com |
| **Public Access Token** | 39cecd7e9fc04be028fb48d01c8072c0 |
| **Private Access Token** | shpat\_08ba\*\*\*\* (NOT shared \- server-side only) |

## **Storefront API Permissions (Final Configuration)**

Permissions were initially over-provisioned, then cleaned up to minimum required scopes.

| Scope | Status | Purpose |
| :---- | :---- | :---- |
| unauthenticated\_read\_product\_listings | Enabled | Read products |
| unauthenticated\_read\_product\_tags | Enabled | Filter products |
| unauthenticated\_read\_checkouts | Enabled | Read checkout |
| unauthenticated\_write\_checkouts | Enabled | Create checkout |
| unauthenticated\_read\_selling\_plans | Enabled | Subscriptions |

**Permissions Removed (security cleanup):**

* unauthenticated\_read\_product\_pickup\_locations  
* unauthenticated\_read\_customers  
* unauthenticated\_write\_customers  
* unauthenticated\_read\_content  
* unauthenticated\_read\_bulk\_operations  
* unauthenticated\_write\_bulk\_operations  
* unauthenticated\_read\_bundles  
* unauthenticated\_read\_metaobjects

**Key Decisions and Notes**

## **Tax Collection Deferred to Monday**

Utah sales tax registration number is required before enabling tax collection. Howard will obtain the tax number Monday and enable Utah sales tax through Settings \> Taxes and duties \> United States \> Utah. This is a critical pre-launch requirement.

## **Architecture Clarification Sent to Team**

* ## Online Store: Hidden (password protected). 

* ## Headless/Storefront API: Active. Replit app reads products from here.

* ## POS: Active. Door to Door Distributors sell products through the POS app with tap to pay.

## **Myshopify Domain Is Permanent**

The domain unicity-international-2.myshopify.com cannot be changed. This is a Shopify platform limitation set at store creation. The primary custom domain unicity.com is connected but has TLS failures that need separate resolution.

## **Domain TLS Failures Noted**

Settings \> Domains shows TLS failures on unicity.com and www.unicity.com. This does not block the pilot but needs resolution. The working domains are gz9sfg-vd.myshopify.com and unicity-international-2.myshopify.com.

## **KnockBase Dev Dashboard App**

The KnockBase app created in the Dev Dashboard is not needed for this use case. It can be deleted. The Headless channel replaced it for Storefront API access.

# **Critical Path Blockers**

1. **Product Catalog Setup:** No products exist in Shopify. Without products, neither POS nor Storefront API channels can function. Team must provide product names, SKUs, prices, and descriptions.  
2. **Utah Sales Tax Registration:** Tax number needed before enabling collection. Deferred to Monday.

# **Remaining TKT-5793 Tickets**

| \# | Ticket | Status | Blocked By |
| :---- | :---- | :---- | :---- |
| 1 | Create Regional POS Location (US-Pilot Territory) | **COMPLETED** |  |
| 2 | Activate POS Pro on Pilot Location | **COMPLETED** |  |
| 3 | Create POS Roles (Distributor \+ POS Manager) | **COMPLETED** |  |
| 4 | Create Store-Level Role for Regional Manager | **COMPLETED** |  |
| 5 | Add Regional Manager | **BLOCKED** | Waiting  |
| 6 | Onboard 10 Distributors | **BLOCKED** | Waiting |
| 7 | Configure Product Catalog | **BLOCKED** | Product info needed |
| 8 | Configure Subscriptions | Not Started | Ticket 7 |
| 9 | Configure Smart Grid | Not Started | Ticket 7 |
| 12 | Enable Utah Sales Tax | **COMPLETED** |   |
| 13 | Configure Payment Settings | **COMPLETED** |  |
| 14 | Test POS Checkout Flow | Not Started | Tickets 6, 7 |
| 15 | Test Subscription Flow | Not Started | Tickets 8, 14 |
| 16 | Configure CSV Export to Unity | Not Started | Ticket 7 |
| 17 | Pre-Launch Validation | Not Started | All above |

