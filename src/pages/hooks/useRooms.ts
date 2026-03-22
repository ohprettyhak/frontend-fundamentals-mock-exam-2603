import { useQuery } from '@tanstack/react-query';
import { getRooms } from 'pages/remotes';

export function useRooms() {
  const { data: rooms = [] } = useQuery(['rooms'], getRooms);

  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  return { rooms, floors };
}
