import {
  NativeConnection,
  Worker,
  bundleWorkflowCode,
} from "@temporalio/worker";
import * as activities from "@cront-atlas/workflow/activities";
import { constants } from "@cront-atlas/workflow";

async function run() {
  const address = process.env.TEMPORAL_SERVER_ADDRESS || "localhost:7233";
  const certificate = process.env.TEMPORAL_TLS_CERTIFICATE;
  const key = process.env.TEMPORAL_TLS_PRIVATE_KEY;

  const connection = await NativeConnection.connect({
    address,
    tls:
      certificate && key
        ? {
            clientCertPair: {
              crt: Buffer.from(certificate),
              key: Buffer.from(key),
            },
          }
        : undefined,
  });

  const { code } = await bundleWorkflowCode({
    workflowsPath: require.resolve("@cront-atlas/workflow/workflows"),
  });

  const worker = await Worker.create({
    workflowBundle: {
      code,
    },
    activities,
    connection,
    taskQueue: constants.QUEUE,
    namespace: constants.NAMESPACE,
  });

  await worker.run();
  connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
