import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRooms } from 'api/remotes';

export function useRooms() {
  const { data: rooms = [] } = useQuery(['rooms'], getRooms);

  const floors = useMemo(
    () => [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b),
    [rooms]
  );

  return { rooms, floors };
}
