import type { Equipment } from '_tosslib/server/types';

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

export const ALL_EQUIPMENT = Object.keys(EQUIPMENT_LABELS) as Equipment[];

const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 20) {
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();
export const START_TIME_SLOTS = TIME_SLOTS.slice(0, -1);
export const END_TIME_SLOTS = TIME_SLOTS.slice(1);
export const HOUR_LABELS = TIME_SLOTS.filter(t => t.endsWith(':00'));

export const TIMELINE_START = 9;
export const TIMELINE_END = 20;
export const TOTAL_MINUTES = (TIMELINE_END - TIMELINE_START) * 60;
