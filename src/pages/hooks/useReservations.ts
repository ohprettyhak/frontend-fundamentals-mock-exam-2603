import { useQuery } from '@tanstack/react-query';
import { getReservations } from 'api/remotes';
import { queryKeys } from 'api/queryKeys';

export function useReservations(date: string) {
  const { data: reservations = [] } = useQuery(
    queryKeys.reservations.byDate(date),
    () => getReservations(date),
    { enabled: !!date }
  );

  return { reservations };
}
