import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPropertyThumbnail(image: any, fallback: string = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'): string {
  if (!image) return fallback;
  if (typeof image === 'string') return image;
  return image.thumbnail || fallback;
}

export function getPropertyOriginal(image: any, fallback: string = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'): string {
  if (!image) return fallback;
  if (typeof image === 'string') return image;
  return image.original || fallback;
}
