type WorkerEnv = {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;

  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  FUNCTION_STORE: R2Bucket;
  // Example binding to a secret. Learn more at https://developers.cloudflare.com/workers/runtime-apis/secrets/
  R2_SIGNING_SECRET: string;
  FUNCTION_STORE_API_KEY: string;
};
