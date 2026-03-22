import { describe, test, expect } from 'vitest';
import type { Room, Reservation, Equipment } from '_tosslib/server/types';
import type { BookingFilters } from './useBookingFilters';
import { filterAvailableRooms } from './filterAvailableRooms';

const rooms: Room[] = [
  { id: 'r1', name: '회의실 A', floor: 3, capacity: 10, equipment: ['tv', 'whiteboard', 'video', 'speaker'] },
  { id: 'r2', name: '회의실 B', floor: 3, capacity: 4, equipment: ['whiteboard'] },
  { id: 'r3', name: '회의실 C', floor: 5, capacity: 6, equipment: ['tv', 'video'] },
  { id: 'r4', name: '회의실 D', floor: 7, capacity: 20, equipment: ['tv', 'whiteboard', 'video', 'speaker'] },
];

const baseFilters: BookingFilters = {
  date: '2026-03-10',
  startTime: '10:00',
  endTime: '11:00',
  attendees: 1,
  equipment: [],
  preferredFloor: null,
};

describe('filterAvailableRooms', () => {
  test('isFilterComplete가 false이면 빈 배열을 반환한다', () => {
    const { availableRooms } = filterAvailableRooms(rooms, [], baseFilters, false);
    expect(availableRooms).toEqual([]);
  });

  test('수용 인원 미달 회의실을 제외한다', () => {
    const filters = { ...baseFilters, attendees: 15 };
    const { availableRooms } = filterAvailableRooms(rooms, [], filters, true);

    expect(availableRooms.every(r => r.capacity >= 15)).toBe(true);
    expect(availableRooms.map(r => r.id)).toEqual(['r4']);
  });

  test('필요 장비가 없는 회의실을 제외한다', () => {
    const filters = { ...baseFilters, equipment: ['video', 'speaker'] as Equipment[] };
    const { availableRooms } = filterAvailableRooms(rooms, [], filters, true);

    expect(availableRooms.every(r =>
      r.equipment.includes('video') && r.equipment.includes('speaker')
    )).toBe(true);
    expect(availableRooms.map(r => r.id)).toEqual(['r1', 'r4']);
  });

  test('선호 층이 지정되면 해당 층만 표시한다', () => {
    const filters = { ...baseFilters, preferredFloor: 5 };
    const { availableRooms } = filterAvailableRooms(rooms, [], filters, true);

    expect(availableRooms.every(r => r.floor === 5)).toBe(true);
    expect(availableRooms.map(r => r.id)).toEqual(['r3']);
  });

  test('시간이 겹치는 예약이 있으면 해당 회의실을 제외한다', () => {
    const reservations: Reservation[] = [
      { id: 'res1', roomId: 'r1', date: '2026-03-10', start: '10:00', end: '11:00', attendees: 5, equipment: ['tv'] },
    ];
    const { availableRooms } = filterAvailableRooms(rooms, reservations, baseFilters, true);

    expect(availableRooms.find(r => r.id === 'r1')).toBeUndefined();
  });

  test('시간이 겹치지 않는 예약은 무시한다', () => {
    const reservations: Reservation[] = [
      { id: 'res1', roomId: 'r1', date: '2026-03-10', start: '11:00', end: '12:00', attendees: 5, equipment: ['tv'] },
    ];
    const { availableRooms } = filterAvailableRooms(rooms, reservations, baseFilters, true);

    expect(availableRooms.find(r => r.id === 'r1')).toBeDefined();
  });

  test('층수 오름차순, 같은 층이면 이름순으로 정렬한다', () => {
    const { availableRooms } = filterAvailableRooms(rooms, [], baseFilters, true);
    const floorNamePairs = availableRooms.map(r => [r.floor, r.name]);

    for (let i = 1; i < floorNamePairs.length; i++) {
      const [prevFloor, prevName] = floorNamePairs[i - 1];
      const [currFloor, currName] = floorNamePairs[i];
      if (prevFloor === currFloor) {
        expect((prevName as string).localeCompare(currName as string)).toBeLessThanOrEqual(0);
      } else {
        expect(prevFloor < currFloor).toBe(true);
      }
    }
  });
});
