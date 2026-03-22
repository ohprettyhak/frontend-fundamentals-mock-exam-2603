import { useQuery } from '@tanstack/react-query';
import { getReservations } from 'api/remotes';

export function useReservations(date: string) {
  const { data: reservations = [] } = useQuery(
    ['reservations', date],
    () => getReservations(date),
    { enabled: !!date }
  );

  return { reservations };
}
