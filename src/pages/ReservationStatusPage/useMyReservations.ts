import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation } from 'api/remotes';

export function useMyReservations() {
  const queryClient = useQueryClient();

  const { data: myReservations = [] } = useQuery(['myReservations'], getMyReservations);

  const cancelMutation = useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });

  return {
    myReservations,
    cancelReservation: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isLoading,
  };
}
