import { Connection, Client } from "@temporalio/client";
import { constants } from "@cron-atlas/workflow";

let clientInstance: Client | null = null;

export const getClient = async (): Promise<Client> => {
  if (!clientInstance) {
    /* Connection (and NativeConnection) objects are very expensive. You should do your best to reuse a single Connection as much as possible.
     **/
    const address = process.env.TEMPORAL_SERVER_ADDRESS || "localhost:7233";
    const namespace = constants.NAMESPACE;
    const certificate = process.env.TEMPORAL_TLS_CERTIFICATE;
    const key = process.env.TEMPORAL_TLS_PRIVATE_KEY;

    const connection = await Connection.connect({
      address: address,
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
    clientInstance = new Client({
      connection,
      namespace,
    });
  }

  return clientInstance;
};
