import shopify from "./shopify.js";

app.use("/api/*", shopify.validateAuthenticatedSession());

app.get("/api/auth", shopify.auth.begin());
app.get("/api/auth/callback", shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot());
app.post(shopify.config.webhooks.path, shopify.processWebhooks());
