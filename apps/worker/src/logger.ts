import pino from "pino";

const logLevel = process.env.LOG_LEVEL || "info";

export function createLogger(name: string = "cron-atlas-worker") {
  const logger = pino(
    { level: logLevel, name },
    pino.transport({
      target: "@axiomhq/pino",
      options: {
        dataset: process.env.AXIOM_DATASET,
        token: process.env.AXIOM_API_TOKEN,
      },
    })
  );

  return logger;
}
