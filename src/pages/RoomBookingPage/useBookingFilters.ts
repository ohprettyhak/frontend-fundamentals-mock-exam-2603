import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Equipment } from '_tosslib/server/types';
import { formatDate, timeToMinutes } from 'pages/utils';

export interface BookingFilters {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
}

export function useBookingFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<BookingFilters>({
    date: searchParams.get('date') || formatDate(new Date()),
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
    attendees: Number(searchParams.get('attendees')) || 1,
    equipment: searchParams.get('equipment') ? searchParams.get('equipment')!.split(',').filter(Boolean) as Equipment[] : [],
    preferredFloor: searchParams.get('floor') ? Number(searchParams.get('floor')) : null,
  });

  const updateFilters = (updates: Partial<BookingFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // URL 쿼리 파라미터 동기화
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.date) params.date = filters.date;
    if (filters.startTime) params.startTime = filters.startTime;
    if (filters.endTime) params.endTime = filters.endTime;
    if (filters.attendees > 1) params.attendees = String(filters.attendees);
    if (filters.equipment.length > 0) params.equipment = filters.equipment.join(',');
    if (filters.preferredFloor !== null) params.floor = String(filters.preferredFloor);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // 입력 검증
  const hasTimeInputs = filters.startTime !== '' && filters.endTime !== '';
  let validationError: string | null = null;
  if (hasTimeInputs) {
    if (timeToMinutes(filters.endTime) <= timeToMinutes(filters.startTime)) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (filters.attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }

  const isFilterComplete = hasTimeInputs && !validationError;

  return { filters, updateFilters, validationError, isFilterComplete };
}
