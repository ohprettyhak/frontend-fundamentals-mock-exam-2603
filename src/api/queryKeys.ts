export const queryKeys = {
  rooms: ['rooms'] as const,
  reservations: {
    all: ['reservations'] as const,
    byDate: (date: string) => ['reservations', date] as const,
  },
  myReservations: ['myReservations'] as const,
};
