import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param {...any[]} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isIframe = window.self !== window.top;
