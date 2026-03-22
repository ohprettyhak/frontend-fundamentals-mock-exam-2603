import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation } from 'api/remotes';
import { queryKeys } from 'api/queryKeys';

export function useMyReservations() {
  const queryClient = useQueryClient();

  const { data: myReservations = [] } = useQuery(queryKeys.myReservations, getMyReservations);

  const cancelMutation = useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.reservations.all);
      queryClient.invalidateQueries(queryKeys.myReservations);
    },
  });

  return {
    myReservations,
    cancelReservation: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isLoading,
  };
}
