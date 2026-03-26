import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://56055128c1fa73d68f201f3e3a6ae1ac@o4511109513936896.ingest.us.sentry.io/4511109544280064",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});