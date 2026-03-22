import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { formatDate } from 'pages/utils';
import { useRooms } from 'pages/hooks/useRooms';
import { useReservations } from 'pages/hooks/useReservations';
import { useMyReservations } from './useMyReservations';
import { DateInput } from 'pages/components/DateInput';
import { MessageBanner } from 'pages/components/MessageBanner';
import { Timeline } from './Timeline';
import { MyReservationList } from './MyReservationList';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState(formatDate(new Date()));

  const messageFromState = (location.state as { message?: string } | null)?.message;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    messageFromState ? { type: 'success', text: messageFromState } : null
  );

  useEffect(() => {
    if (messageFromState) {
      window.history.replaceState({}, '');
    }
  }, [messageFromState]);

  const { rooms } = useRooms();
  const { reservations } = useReservations(date);
  const { myReservations, cancelReservation, isCancelling } = useMyReservations();

  const handleCancel = async (id: string) => {
    try {
      await cancelReservation(id);
      setMessage({ type: 'success', text: '예약이 취소되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '취소에 실패했습니다.' });
    }
  };

  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        회의실 예약
      </Top.Top03>

      <Spacing size={24} />

      {/* 날짜 선택 */}
      <div css={css`padding: 0 24px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <DateInput value={date} onChange={setDate} />
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 현황 타임라인 */}
      <div css={css`padding: 0 24px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 현황
        </Text>
        <Spacing size={16} />
        <Timeline rooms={rooms} reservations={reservations} />
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 메시지 배너 */}
      {message && (
        <div css={css`padding: 0 24px;`}>
          <MessageBanner type={message.type} message={message.text} />
          <Spacing size={12} />
        </div>
      )}

      {/* 내 예약 목록 */}
      <div css={css`padding: 0 24px;`}>
        <MyReservationList
          reservations={myReservations}
          rooms={rooms}
          onCancel={handleCancel}
          isCancelling={isCancelling}
        />
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약하기 버튼 */}
      <div css={css`padding: 0 24px;`}>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}
