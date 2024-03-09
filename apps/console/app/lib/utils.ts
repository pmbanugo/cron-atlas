import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function raiseError(message: string): never {
  throw new Error(message);
}

export function findErrorMessage(result: [any], fieldName: string) {
  return result?.find((d: any) => d?.key === fieldName)?.msg;
};