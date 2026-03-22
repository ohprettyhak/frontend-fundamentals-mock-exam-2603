import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Equipment } from '_tosslib/server/types';
import { createReservation } from 'api/remotes';
import axios from 'axios';

interface BookingRequest {
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipment: Equipment[];
}

type BookingResult =
  | { success: true }
  | { success: false; message: string };

export function useCreateReservation() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (data: BookingRequest) => createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['reservations', variables.date]);
        queryClient.invalidateQueries(['myReservations']);
      },
    }
  );

  const book = async (data: BookingRequest): Promise<BookingResult> => {
    try {
      const result = await mutation.mutateAsync(data);

      if ('ok' in result && result.ok) {
        return { success: true };
      }

      const errResult = result as { message?: string };
      return { success: false, message: errResult.message ?? '예약에 실패했습니다.' };
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      return { success: false, message: serverMessage };
    }
  };

  return {
    book,
    isCreating: mutation.isLoading,
  };
}
