import type { Equipment } from '_tosslib/server/types';

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

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
export const TIMELINE_START = 9;
export const TIMELINE_END = 20;
