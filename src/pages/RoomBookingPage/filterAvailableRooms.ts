import type { Room, Reservation, Equipment } from '_tosslib/server/types';
import type { BookingFilters } from './useBookingFilters';

export function filterAvailableRooms(
  rooms: Room[],
  reservations: Reservation[],
  filters: BookingFilters,
  isFilterComplete: boolean
) {
  if (!isFilterComplete) return { availableRooms: [] };

  const { date, startTime, endTime, attendees, equipment, preferredFloor } = filters;

  const availableRooms = rooms
    .filter(room => {
      const hasEnoughCapacity = room.capacity >= attendees;
      const hasRequiredEquipment = equipment.every(eq => room.equipment.includes(eq as Equipment));
      const isOnPreferredFloor = preferredFloor === null || room.floor === preferredFloor;
      const hasNoTimeConflict = !reservations.some(
        r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
      );

      return hasEnoughCapacity && hasRequiredEquipment && isOnPreferredFloor && hasNoTimeConflict;
    })
    .sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });

  return { availableRooms };
}
