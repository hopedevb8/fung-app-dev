import { shopifyApp } from '@shopify/shopify-app-express';
import { LATEST_API_VERSION } from '@shopify/shopify-api';
import shopify from "./shopify.js";

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    scopes: ['read_products', 'write_products'],
  },
  webhooks: {
    path: "/api/webhooks",
    webhookHandlers: {
    },
  }
});

export default shopify;
