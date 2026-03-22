import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Top, Spacing, Border, Button, Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS, HOUR_LABELS, TOTAL_MINUTES } from 'pages/constants';
import { formatDate, timeToMinutes } from 'pages/utils';
import { useRooms } from 'pages/hooks/useRooms';
import { useReservations } from 'pages/hooks/useReservations';
import { useMyReservations } from 'pages/hooks/useMyReservations';
import { DateInput } from 'pages/components/DateInput';
import { MessageBanner } from 'pages/components/MessageBanner';
import { SectionHeader } from 'pages/components/SectionHeader';
import { EmptyState } from 'pages/components/EmptyState';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState(formatDate(new Date()));

  const locationState = location.state as { message?: string } | null;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    locationState?.message ? { type: 'success', text: locationState.message } : null
  );

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const { rooms } = useRooms();
  const { reservations } = useReservations(date);
  const { myReservations: myReservationList, cancelReservation } = useMyReservations();

  const handleCancel = async (id: string) => {
    try {
      await cancelReservation(id);
      setMessage({ type: 'success', text: '예약이 취소되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '취소에 실패했습니다.' });
    }
  };

  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

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

        <div css={css`background: ${colors.grey50}; border-radius: 14px; padding: 16px;`}>
          {/* 시간 헤더 */}
          <div css={css`display: flex; align-items: flex-end; margin-bottom: 8px;`}>
            <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`} />
            <div css={css`flex: 1; position: relative; height: 18px;`}>
              {HOUR_LABELS.map(t => {
                const left = (timeToMinutes(t) / TOTAL_MINUTES) * 100;
                return (
                  <Text
                    key={t}
                    typography="t7"
                    fontWeight="regular"
                    color={colors.grey400}
                    css={css`
                      position: absolute; left: ${left}%; transform: translateX(-50%);
                      font-size: 10px; letter-spacing: -0.3px;
                    `}
                  >
                    {t.slice(0, 2)}
                  </Text>
                );
              })}
            </div>
          </div>

          {/* 회의실별 타임라인 */}
          {rooms.map((room: { id: string; name: string }, index: number) => {
            const roomReservations = reservations.filter((r: { roomId: string }) => r.roomId === room.id);
            return (
              <div
                key={room.id}
                css={css`display: flex; align-items: center; height: 32px; ${index > 0 ? 'margin-top: 4px;' : ''}`}
              >
                <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`}>
                  <Text typography="t7" fontWeight="medium" color={colors.grey700} ellipsisAfterLines={1}
                    css={css`font-size: 12px;`}
                  >
                    {room.name}
                  </Text>
                </div>
                <div css={css`flex: 1; height: 24px; background: ${colors.white}; border-radius: 6px; position: relative; overflow: visible;`}>
                  {roomReservations.map((res: { id: string; start: string; end: string; attendees: number; equipment: string[] }) => {
                    const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
                    const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
                    const isActive = activeReservation === res.id;
                    return (
                      <div key={res.id} css={css`position: absolute; left: ${left}%; width: ${width}%; height: 100%;`}>
                        <div
                          role="button"
                          aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
                          onClick={() => setActiveReservation(isActive ? null : res.id)}
                          css={css`
                            width: 100%; height: 100%; background: ${colors.blue400}; border-radius: 4px;
                            opacity: ${isActive ? 1 : 0.75}; cursor: pointer; transition: opacity 0.15s;
                            &:hover { opacity: 1; }
                          `}
                        />
                        {isActive && (
                          <div
                            role="tooltip"
                            css={css`
                              position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 6px;
                              background: ${colors.grey900}; color: ${colors.white}; padding: 8px 12px;
                              border-radius: 8px; font-size: 12px; white-space: nowrap; z-index: 10;
                              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); line-height: 1.6;
                            `}
                          >
                            <div>{res.start} ~ {res.end}</div>
                            <div>{res.attendees}명</div>
                            {res.equipment.length > 0 && (
                              <div>{res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ')}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
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
        <SectionHeader title="내 예약" count={myReservationList.length} countUnit="건" />
        <Spacing size={16} />

        {myReservationList.length === 0 ? (
          <EmptyState message="예약 내역이 없습니다." />
        ) : (
          <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
            {myReservationList.map((res: { id: string; roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] }) => (
              <div
                key={res.id}
                css={css`padding: 14px 16px; border-radius: 14px; background: ${colors.grey50}; border: 1px solid ${colors.grey200};`}
              >
                <ListRow
                  contents={
                    <ListRow.Text2Rows
                      top={getRoomName(res.roomId)}
                      topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                      bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'}`}
                      bottomProps={{ typography: 't7', color: colors.grey600 }}
                    />
                  }
                  right={
                    <Button
                      type="danger"
                      style="weak"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('정말 취소하시겠습니까?')) {
                          handleCancel(res.id);
                        }
                      }}
                    >
                      취소
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        )}
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
