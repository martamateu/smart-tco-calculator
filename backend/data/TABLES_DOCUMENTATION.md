# 📊 SA360 Audit Tables - Complete Documentation

## Overview

This audit extracts **9 tables** from Search Ads 360, organized in 3 levels:
1. **Audit Summary** (1 table) - Aggregated analysis with maturity score
2. **Submanager Level** (4 tables) - Configuration at submanager/MCC level
3. **Advertiser Level** (4 tables) - Configuration per advertiser account

---

## 🎯 1. Audit Summary Table

**Table:** `audit_summary_{submanager_id}`  
**Purpose:** Comprehensive maturity assessment with key metrics and scoring  
**Sheet Name:** `audit_summary`

### Fields (28 total)

| Field | Type | Description |
|-------|------|-------------|
| `submanager_id` | STRING | Submanager customer ID |
| `audit_date` | TIMESTAMP | When the audit was run |
| **Submanager Conversion Metrics** |
| `submanager_total_conversions` | INTEGER | Total conversion actions configured |
| `submanager_enabled_conversions` | INTEGER | Active conversion actions |
| `submanager_floodlight_conversions` | INTEGER | Floodlight-based conversions |
| `submanager_conversion_categories` | INTEGER | Unique conversion categories |
| **Submanager Bidding Metrics** |
| `submanager_total_bid_strategies` | INTEGER | Total bidding strategies |
| `submanager_enabled_bid_strategies` | INTEGER | Active bidding strategies |
| `tcpa_strategies` | INTEGER | Target CPA strategies |
| `troas_strategies` | INTEGER | Target ROAS strategies |
| `max_conv_strategies` | INTEGER | Maximize Conversions strategies |
| `max_conv_value_strategies` | INTEGER | Maximize Conversion Value strategies |
| **Advertiser Summary** |
| `total_advertisers` | INTEGER | Total advertiser accounts |
| `active_advertisers` | INTEGER | Active advertiser accounts |
| `test_accounts` | INTEGER | Test/development accounts |
| **Advertiser Metrics** |
| `advertisers_using_audiences` | INTEGER | Advertisers with audience targeting |
| `total_audiences` | INTEGER | Total audience lists configured |
| `advertisers_with_conversion_tracking` | INTEGER | Advertisers with conversion tracking |
| `unique_attribution_models` | INTEGER | Different attribution models used |
| `avg_conversion_value` | FLOAT | Average conversion value setting |
| **Maturity Indicators** |
| `uses_floodlight` | STRING | "YES" / "NO" - Floodlight implementation |
| `bidding_maturity` | STRING | Bidding sophistication level |
| `uses_audiences` | STRING | "YES" / "NO" - Audience targeting |
| `attribution_maturity` | STRING | "ADVANCED" / "BASIC" / "NONE" |
| **Overall Score** |
| `maturity_score_0_to_100` | INTEGER | Overall maturity score (0-100) |

### Maturity Score Calculation

The score is calculated from 4 components (25 points each):

1. **Floodlight Tracking (25 pts)**
   - 25 points if `floodlight_conversions > 0`
   - 0 points otherwise

2. **Advanced Bidding (25 pts)**
   - 25 points if using ROAS or Value bidding
   - 0 points for CPA or Manual bidding

3. **Audience Usage (25 pts)**
   - 25 points if `advertisers_using_audiences > 0`
   - 0 points otherwise

4. **Attribution Models (25 pts)**
   - 25 points if using 2+ attribution models
   - 0 points otherwise

**Maximum Score:** 100 points (indicates advanced SA360 maturity)

---

## 📋 2. Submanager Level Tables

### 2.1 Customer Information

**Table:** `conversion_tracking_customer_submanager`  
**Purpose:** General submanager account configuration  
**Sheet Name:** `submanager_customer`

| Field | Description |
|-------|-------------|
| `customer.id` | Submanager account ID |
| `customer.descriptiveName` | Account display name |
| `customer.currencyCode` | Default currency (e.g., "EUR", "USD") |
| `customer.timeZone` | Account timezone |
| `customer.autoTaggingEnabled` | Auto-tagging status |
| `customer.manager` | Whether this is a manager account |
| `customer.status` | Account status (ENABLED/PAUSED) |
| `customer.conversionTrackingSetting` | Conversion tracking configuration |
| `customer.accountType` | Type of SA360 account |
| `customer.creationTime` | When account was created |

---

### 2.2 Conversion Actions

**Table:** `conversion_tracking_action_submanager`  
**Purpose:** All conversion actions configured at submanager level  
**Sheet Name:** `submanager_conversions`

| Field | Description |
|-------|-------------|
| `conversionAction.id` | Conversion action ID |
| `conversionAction.name` | Conversion action name |
| `conversionAction.type` | Type (FLOODLIGHT_TRANSACTION, FLOODLIGHT_ACTION, etc.) |
| `conversionAction.category` | Conversion category |
| `conversionAction.status` | ENABLED, PAUSED, or REMOVED |
| `conversionAction.primaryForGoal` | Whether primary for goal tracking |
| `conversionAction.clickThroughLookbackWindowDays` | Click lookback window |

**Key Insight:** Floodlight conversions are identified by `type LIKE 'FLOODLIGHT%'`

---

### 2.3 Bidding Strategies

**Table:** `bidding_strategy_submanager`  
**Purpose:** Shared bidding strategies available to advertisers  
**Sheet Name:** `submanager_bidding`

| Field | Description |
|-------|-------------|
| `biddingStrategy.id` | Strategy ID |
| `biddingStrategy.name` | Strategy name |
| `biddingStrategy.type` | Strategy type (TARGET_ROAS, TARGET_CPA, etc.) |
| `biddingStrategy.status` | ENABLED or PAUSED |
| `biddingStrategy.currencyCode` | Currency for this strategy |
| `biddingStrategy.campaignCount` | Number of campaigns using this strategy |

**Strategy Types:**
- `TARGET_ROAS` - Return on Ad Spend (most advanced)
- `TARGET_CPA` - Cost per Acquisition
- `MAXIMIZE_CONVERSIONS` - Volume optimization
- `MAXIMIZE_CONVERSION_VALUE` - Value optimization
- `MANUAL_CPC` - Manual bidding

---

### 2.4 Advertisers List

**Table:** `customer_client_submanager`  
**Purpose:** All advertiser accounts under this submanager  
**Sheet Name:** `submanager_advertisers`

| Field | Description |
|-------|-------------|
| `customerClient.id` | Advertiser account ID |
| `customerClient.descriptiveName` | Advertiser display name |
| `customerClient.status` | ENABLED, PAUSED, etc. |
| `customerClient.level` | Account hierarchy level (1+ for advertisers) |
| `customerClient.testAccount` | TRUE if test account |

**Note:** Only accounts with `level > 0` are included (actual advertisers, not managers)

---

## 🎯 3. Advertiser Level Tables

All advertiser tables include `advertiser_id` field to identify which advertiser each row belongs to.

### 3.1 Accessible Bidding Strategies

**Table:** `accessible_bidding_strategy_advertiser`  
**Purpose:** Bidding strategies accessible to each advertiser  
**Sheet Name:** `advertiser_bidding`

| Field | Description |
|-------|-------------|
| `advertiser_id` | Advertiser account ID |
| `accessibleBiddingStrategy.name` | Strategy name |
| `accessibleBiddingStrategy.owner_descriptive_name` | Who owns the strategy |
| `accessibleBiddingStrategy.target_cpa` | Target CPA amount (if applicable) |
| `accessibleBiddingStrategy.target_cpa_micros` | Target CPA in micros |
| `accessibleBiddingStrategy.target_roas` | Target ROAS value (if applicable) |

**Key Insight:** Shows which shared strategies each advertiser can use

---

### 3.2 Audiences

**Table:** `audience_advertiser`  
**Purpose:** Audience lists configured per advertiser  
**Sheet Name:** `advertiser_audiences`

| Field | Description |
|-------|-------------|
| `advertiser_id` | Advertiser account ID |
| `audience.name` | Audience list name |
| `audience.description` | Audience description (if available) |

**Limitation:** SA360 API provides very limited audience information (no size, type, or rules)

---

### 3.3 Labels

**Table:** `label_advertiser`  
**Purpose:** Active labels for campaign organization  
**Sheet Name:** `advertiser_labels`

| Field | Description |
|-------|-------------|
| `advertiser_id` | Advertiser account ID |
| `label.name` | Label name |
| `label.status` | ENABLED (only enabled labels are queried) |

**Limitation:** Label colors and descriptions not available in API

---

### 3.4 Advertiser Conversion Actions

**Table:** `conversion_action_advertiser`  
**Purpose:** Conversion tracking configuration per advertiser  
**Sheet Name:** `advertiser_conversions`

| Field | Description |
|-------|-------------|
| `advertiser_id` | Advertiser account ID |
| `conversionAction.name` | Conversion action name |
| `conversionAction.category` | Conversion category |
| `conversionAction.status` | ENABLED, PAUSED, REMOVED |
| `conversionAction.attributionModelSettings.attributionModel` | Attribution model used |
| `conversionAction.valueSettings.defaultValue` | Default conversion value |

**Attribution Models:**
- `LAST_CLICK` - Last click attribution
- `FIRST_CLICK` - First click attribution
- `LINEAR` - Linear attribution
- `TIME_DECAY` - Time decay attribution
- `POSITION_BASED` - Position-based attribution
- `DATA_DRIVEN` - Data-driven attribution (most advanced)

---

## 📊 Excel Export Structure

The Excel file contains 9 sheets in this order:

1. **audit_summary** - Overall maturity assessment (START HERE)
2. **submanager_customer** - Submanager account info
3. **submanager_conversions** - Conversion actions
4. **submanager_bidding** - Bidding strategies
5. **submanager_advertisers** - List of advertisers
6. **advertiser_bidding** - Per-advertiser bidding access
7. **advertiser_audiences** - Per-advertiser audiences
8. **advertiser_labels** - Per-advertiser labels
9. **advertiser_conversions** - Per-advertiser conversion tracking

**Filename format:** `sa360_audit_{submanager_id}_{timestamp}.xlsx`

---

## 🔍 How to Use This Data

### Quick Health Check
1. Open Excel file
2. Go to **audit_summary** sheet
3. Check `maturity_score_0_to_100` (higher = better)
4. Review maturity indicators:
   - `uses_floodlight` should be "YES"
   - `bidding_maturity` should be "ROAS/Value bidding"
   - `uses_audiences` should be "YES"
   - `attribution_maturity` should be "ADVANCED"

### Deep Dive Analysis
1. **Conversion Tracking:** Check `submanager_conversions` for Floodlight setup
2. **Bidding:** Review `submanager_bidding` for smart bidding adoption
3. **Advertisers:** See `submanager_advertisers` for account structure
4. **Per-Advertiser Details:** Filter advertiser tables by `advertiser_id`

### Recommendations
- **Score < 50:** Basic setup, needs improvement
- **Score 50-75:** Good foundation, some advanced features
- **Score 76-99:** Advanced setup, minor optimizations possible
- **Score 100:** Fully optimized SA360 implementation

---

## 🚨 Important Notes

### Data Limitations
- **Audience details** (type, size, rules) not available via API
- **Label colors** not available via API
- **Campaign-level data** not included in this audit (focused on account configuration)

### Refresh Frequency
- Run audit monthly to track maturity progress
- BigQuery tables use `replace_if_different` (submanager) or `append` (advertiser) modes
- Excel export is a snapshot for reporting purposes

### BigQuery vs Excel
- **BigQuery:** Source of truth, queryable, historical data
- **Excel:** Easy sharing, pivot tables, temporary analysis tool
- After review, data lives permanently in BigQuery for SQL analysis

---

## 📝 SQL Query Examples

See `SQL_QUERIES_FOR_LEE.md` for 10+ example queries to analyze this data in BigQuery.

---

**Generated by SA360 Maturity Audit Tool**  
**Last Updated:** October 2025
