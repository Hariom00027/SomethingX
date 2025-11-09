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

/**
 * Maps template names to their corresponding thumbnail file paths
 * @param {string} templateName - The name of the template
 * @returns {string} - Path to the thumbnail image
 */
export const getTemplateThumbnail = (templateName) => {
  if (!templateName) return null;
  
  // Normalize template name for matching (lowercase, remove special chars)
  const normalized = templateName.toLowerCase().trim();
  
  // Map template names to thumbnail file names
  const thumbnailMap = {
    'classic professional': '/assets/templates/thumbnails/Classic Professional.png',
    'corporate headshot': '/assets/templates/thumbnails/Corporate headshot.png',
    'creative portfolio': '/assets/templates/thumbnails/Creative Portfolio.png',
    'executive': '/assets/templates/thumbnails/Executive.png',
    'minimalist': '/assets/templates/thumbnails/Minimalist.png',
    'modern professional': '/assets/templates/thumbnails/Modern Professional.png',
    'traditional': '/assets/templates/thumbnails/Traditional.png',
  };
  
  // Try exact match first
  if (thumbnailMap[normalized]) {
    return thumbnailMap[normalized];
  }
  
  // Try partial matching
  for (const [key, value] of Object.entries(thumbnailMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Fallback: try to construct from template name
  // Replace spaces with %20 or use a default
  const fallbackName = templateName.replace(/\s+/g, ' ');
  return `/assets/templates/thumbnails/${fallbackName}.png`;
};