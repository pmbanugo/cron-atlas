import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function raiseError(message: string): never {
  throw new Error(message);
}

export function getEnv(name: string) {
  return (
    process.env[name] ?? raiseError(`Missing environment variable: ${name}`)
  );
}

export function getFlyAppName(jobId: string) {
  // use lowercase because fly apps can't have uppercase letters
  return `function-${jobId.toLowerCase()}`;
}
