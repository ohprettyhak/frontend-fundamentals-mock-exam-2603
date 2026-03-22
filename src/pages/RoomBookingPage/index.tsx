import { css } from '@emotion/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Spacing, Border } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { useRooms } from 'pages/hooks/useRooms';
import { useReservations } from 'pages/hooks/useReservations';
import { useBooking } from './useBooking';
import { MessageBanner } from 'pages/components/MessageBanner';
import { useBookingFilters } from './useBookingFilters';
import { filterAvailableRooms } from './filterAvailableRooms';
import { FilterPanel } from './FilterPanel';
import { AvailableRoomList } from './AvailableRoomList';

export function RoomBookingPage() {
  const navigate = useNavigate();
  const { filters, updateFilters, validationError, isFilterComplete } = useBookingFilters();
  const { rooms, floors } = useRooms();
  const { reservations } = useReservations(filters.date);
  const { book, isBooking } = useBooking();
  const { availableRooms } = useMemo(
    () => filterAvailableRooms(rooms, reservations, filters, isFilterComplete),
    [rooms, reservations, filters, isFilterComplete]
  );

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    updateFilters(updates);
    setSelectedRoomId(null);
    setErrorMessage(null);
  };

  const handleBook = async () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }

    const result = await book({
      roomId: selectedRoomId,
      date: filters.date,
      start: filters.startTime,
      end: filters.endTime,
      attendees: filters.attendees,
      equipment: filters.equipment,
    });

    if (result.success) {
      navigate('/', { state: { message: '예약이 완료되었습니다!' } });
    } else {
      setErrorMessage(result.message);
      setSelectedRoomId(null);
    }
  };

  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <div css={css`padding: 12px 24px 0;`}>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="뒤로가기"
          css={css`
            background: none; border: none; padding: 0; cursor: pointer; font-size: 14px;
            color: ${colors.grey600}; &:hover { color: ${colors.grey900}; }
          `}
        >
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        예약하기
      </Top.Top03>

      {errorMessage && (
        <div css={css`padding: 0 24px;`}>
          <Spacing size={12} />
          <MessageBanner type="error" message={errorMessage} />
        </div>
      )}

      <Spacing size={24} />

      <div css={css`padding: 0 24px;`}>
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          floors={floors}
          validationError={validationError}
        />
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {isFilterComplete && (
        <div css={css`padding: 0 24px;`}>
          <AvailableRoomList
            rooms={availableRooms}
            selectedRoomId={selectedRoomId}
            onSelect={setSelectedRoomId}
            onBook={handleBook}
            isBooking={isBooking}
          />
        </div>
      )}

      <Spacing size={24} />
    </div>
  );
}
