import { BillingInterval, BillingReplacementBehavior, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { MongoDBSessionStorage } from '@shopify/shopify-app-session-storage-mongodb';
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

const DB_PATH = `${process.cwd()}/database.sqlite`;

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "MONTHLY": {
    interval: BillingInterval.Every30Days,
    amount: 29.98,
    currencyCode: "USD",
    trialDays: 10,
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    test: true,
  },
  "USAGE": {
    interval: BillingInterval.Usage,
    amount: 50,
    currencyCode: "USD",
    trialDays: 7,
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    test: true,
    usageTerms: "$0.01 per order per month"
  }
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: billingConfig, // or replace with billingConfig above to enable example billing
    scopes: ['read_products','write_products','write_content','write_inventory','read_inventory','read_price_rules','write_price_rules','read_themes','write_themes']
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new MongoDBSessionStorage(
    'mongodb+srv://lyonikgeo:cYRoZyEpBuiaru9x@cluster0.jjyz5.mongodb.net',
    'inventoryapp',
  )
});

export default shopify;
