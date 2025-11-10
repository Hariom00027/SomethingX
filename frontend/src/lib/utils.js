import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const api = (() => {
  const inDocker = window.location.hostname === 'localhost' && window.location.port === '3000';
  // When served by nginx (Docker), there's no dev proxy; call backend directly
  const baseURL = inDocker ? 'http://localhost:8080' : '';
  return { baseURL };
})();
