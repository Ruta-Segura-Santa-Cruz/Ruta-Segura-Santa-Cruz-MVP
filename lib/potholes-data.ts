import type { Pothole } from '@/lib/types';

export async function loadPotholes(): Promise<Pothole[]> {
  try {
    const res = await fetch('/data/potholes.json');
    if (!res.ok) {
      return [];
    }
    const data: Pothole[] = await res.json();
    return data;
  } catch {
    return [];
  }
}
