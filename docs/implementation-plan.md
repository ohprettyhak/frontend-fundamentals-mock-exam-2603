# 구현 계획서

## 작업 범위

- `src/pages/` 하위 파일이 리팩토링 대상입니다.
- **`src/_tosslib/`는 제공 패키지이므로 수정하지 않습니다.** 해당 폴더의 컴포넌트, 타입, 서버 목(mock)은 있는 그대로 import하여 사용합니다.

---

## 현재 프로젝트 상태 분석

### 구현 현황

두 페이지 모두 **기능적으로 완성**된 상태입니다.

- `ReservationStatusPage/index.tsx` (305줄) — 단일 컴포넌트로 모든 UI/로직 포함
- `RoomBookingPage/index.tsx` (402줄) — 단일 컴포넌트로 모든 UI/로직 포함
- `remotes.ts` — API 호출 함수 (타입 인라인 정의)
- `http.ts` — Axios 래퍼

### 테스트 현황

- `App.easy.spec.tsx` — 기본 기능 테스트 14개 (예약 현황 7 + 예약하기 7)
- `App.hard.spec.tsx` — 심화 기능 테스트 6개 (예약 현황 1 + 예약하기 5)
- **전체 실패**: Node.js v25 환경에서 MSW 0.35.0 호환성 문제 (`.nvmrc`는 22.12.0 지정)

### 코드 품질 문제점 (Toss Frontend Fundamentals 기준)

#### 가독성 (Readability)

- 300~400줄의 단일 컴포넌트에 모든 로직이 혼재
- 인라인 타입 어노테이션이 코드 흐름을 방해 (예: `(room: { id: string; name: string; floor: number; ... })`)
- 복잡한 조건식에 이름이 부여되지 않음 (필터링 로직)
- 인라인 CSS가 컴포넌트 구조 파악을 어렵게 만듦

#### 응집도 (Cohesion)

- `src/pages/components/` 폴더가 **존재하지 않음** (요구사항에서 활용 지시)
- 함께 변경되는 코드가 분리되지 않음 (타임라인 UI + 타임라인 계산 로직)
- 관련 상수/유틸리티가 페이지 컴포넌트 파일 최상단에 혼재

#### 결합도 (Coupling)

- 두 페이지 간 **중복 코드**: `EQUIPMENT_LABELS`, `TIME_SLOTS`, `formatDate`, 입력 스타일
- `_tosslib/server/types.ts`에 `Room`, `Reservation`, `Equipment` 타입이 정의되어 있으나 페이지에서 미사용 (import만 하면 되는 상황)
- `remotes.ts`에서 인라인 타입 정의 → 타입 변경 시 여러 곳 수정 필요

#### 예측 가능성 (Predictability)

- `handleFilterChange`가 상태 초기화만 수행하지만 이름에서 유추 어려움
- `createMutation`의 성공/실패 분기가 `handleBook` 안에서 복잡하게 얽힘
- URL 쿼리 파라미터 동기화 로직이 컴포넌트 본체에 노출

---

## 리팩토링 원칙

[Toss Frontend Fundamentals](https://frontend-fundamentals.com) 기반:

1. **맥락 분리**: 함께 실행되지 않는 코드는 분리한다
2. **명확한 이름**: 복잡한 조건과 매직 넘버에 의미 있는 이름을 부여한다
3. **위에서 아래로 읽히는 흐름**: 컴포넌트가 선언적으로 "무엇을 하는지" 드러내게 한다
4. **함께 변경되는 코드는 함께 둔다**: 관련 로직을 같은 모듈에 배치한다
5. **중복보다 의존성이 위험할 때만 추상화한다**: 불필요한 추상화를 피한다

---

## 구현 스텝

### Step 0. 기반 환경 정비 ✅

**목표**: 테스트가 실행 가능한 환경을 확보하고, 이후 리팩토링의 안전망을 마련한다.

**작업 내용**:

1. Node.js 버전 정합성 확인 (`.nvmrc` 22.12.0 vs 현재 환경)
2. 테스트 실행 가능 여부 확인 및 MSW 호환성 문제 해결
3. 현재 테스트 전체 통과 확인

**완료 기준**: `yarn test` 실행 시 기존 20개 테스트 전체 통과

**결과**: Node.js 22.12.0 (asdf `.tool-versions` 설정 확인)에서 MSW 0.35.0 정상 동작, 20개 테스트 전체 통과 확인. 셸 PATH에서 Node v25가 우선 참조되는 환경 이슈 — 테스트 실행 시 asdf가 관리하는 Node 22.12.0 사용 필요.

---

### Step 1. 공유 상수 및 유틸리티 추출 ✅

**목표**: 두 페이지에 흩어진 중복 상수/유틸을 한 곳으로 모아 결합도를 낮춘다.

**작업 내용**:

1. `src/pages/constants.ts` 생성
   - `EQUIPMENT_LABELS` — 장비 라벨 매핑
   - `ALL_EQUIPMENT` — 전체 장비 목록
   - `TIME_SLOTS` — 시간 슬롯 배열
   - `START_TIME_SLOTS` / `END_TIME_SLOTS` — 시작/종료 시간 옵션
   - `TIMELINE_START`, `TIMELINE_END`, `TOTAL_MINUTES` — 타임라인 상수

2. `src/pages/utils.ts` 생성
   - `formatDate(date: Date): string`
   - `timeToMinutes(time: string): number`
   - `getTodayString(): string`

3. `remotes.ts` 리팩토링
   - 인라인 타입을 `_tosslib/server/types.ts`의 `Room`, `Reservation`, `Equipment`로 교체
   - API 응답 타입(`CreateReservationResponse` 등)은 `remotes.ts` 내에 정의

4. 두 페이지에서 중복 상수/유틸 제거 후 import로 교체

**완료 기준**: 기존 테스트 전체 통과, 두 페이지에서 중복 상수/유틸이 사라짐

**변경 파일**:
- 신규: `src/pages/constants.ts`, `src/pages/utils.ts`
- 수정: `src/pages/remotes.ts`, `ReservationStatusPage/index.tsx`, `RoomBookingPage/index.tsx`

---

### Step 2. 커스텀 훅 추출 ✅

**목표**: 데이터 페칭과 비즈니스 로직을 커스텀 훅으로 분리하여, 페이지 컴포넌트가 "무엇을 보여줄지"에만 집중하게 한다.

**작업 내용**:

1. `src/pages/hooks/useRooms.ts`
   - `useQuery(['rooms'], getRooms)` 래핑
   - 반환: `{ rooms, floors }` (floors = 중복 제거 + 정렬된 층 목록)

2. `src/pages/hooks/useReservations.ts`
   - `useQuery(['reservations', date], ...)` 래핑
   - 반환: `{ reservations }`

3. `src/pages/hooks/useMyReservations.ts`
   - `useQuery(['myReservations'], ...)` + 취소 mutation
   - 반환: `{ myReservations, cancelReservation, isCancelling }`

4. `src/pages/hooks/useCreateReservation.ts`
   - 예약 생성 mutation + 성공/실패 처리 로직
   - 에러 핸들링을 훅 내부에 캡슐화하여 예측 가능한 반환값 제공
   - 반환: `{ createReservation, isCreating }`

**완료 기준**: 기존 테스트 전체 통과, 페이지 컴포넌트에서 React Query 직접 호출 제거

**변경 파일**:
- 신규: `src/pages/hooks/useRooms.ts`, `useReservations.ts`, `useMyReservations.ts`, `useCreateReservation.ts`
- 수정: `ReservationStatusPage/index.tsx`, `RoomBookingPage/index.tsx`

---

### Step 3. 공유 UI 컴포넌트 추출 ✅

**목표**: 두 페이지에서 공통으로 사용하는 UI 패턴을 `src/pages/components/`로 추출한다.

**작업 내용**:

1. `src/pages/components/DateInput.tsx`
   - 날짜 선택 input (min=오늘, 스타일 포함)
   - Props: `value`, `onChange`, `label?`

2. `src/pages/components/MessageBanner.tsx`
   - 성공/에러 메시지 배너
   - Props: `type: 'success' | 'error'`, `message: string`

3. `src/pages/components/SectionHeader.tsx`
   - 섹션 제목 + 카운트 표시 패턴
   - Props: `title`, `count?`, `countUnit?` (예: "건", "개")

4. `src/pages/components/EmptyState.tsx`
   - 빈 상태 메시지 표시
   - Props: `message: string`

**완료 기준**: 기존 테스트 전체 통과, 두 페이지에서 공통 UI 패턴 제거

**변경 파일**:
- 신규: `src/pages/components/DateInput.tsx`, `MessageBanner.tsx`, `SectionHeader.tsx`, `EmptyState.tsx`
- 수정: `ReservationStatusPage/index.tsx`, `RoomBookingPage/index.tsx`

---

### Step 4. 예약 현황 페이지 컴포넌트 분리

**목표**: `ReservationStatusPage`를 선언적 컴포넌트 조합으로 재구성한다.

**작업 내용**:

1. `src/pages/ReservationStatusPage/Timeline.tsx`
   - 회의실별 예약 타임라인 시각화
   - 예약 블록 클릭 시 상세 정보 툴팁 표시 (툴팁은 Timeline 내부에 포함)
   - Props: `rooms`, `reservations`

2. `src/pages/ReservationStatusPage/MyReservationList.tsx`
   - 내 예약 목록 + 취소 기능
   - Props: `reservations`, `rooms`, `onCancel`

3. `src/pages/ReservationStatusPage/index.tsx` 리팩토링
   - 위 컴포넌트들을 조합하는 **선언적 구조**로 재작성
   - 페이지 컴포넌트는 데이터 흐름과 레이아웃만 담당

**목표 구조** (선언적 읽기 흐름):

```tsx
function ReservationStatusPage() {
  const { rooms } = useRooms();
  const [date, setDate] = useState(getTodayString());
  const { reservations } = useReservations(date);
  const { myReservations, cancelReservation } = useMyReservations();

  return (
    <>
      <PageHeader title="회의실 예약" />
      <DateInput value={date} onChange={setDate} />
      <Timeline rooms={rooms} reservations={reservations} />
      <MyReservationList
        reservations={myReservations}
        rooms={rooms}
        onCancel={cancelReservation}
      />
      <BookingButton />
    </>
  );
}
```

**완료 기준**: 기존 테스트 전체 통과, `ReservationStatusPage/index.tsx` 100줄 이내

**변경 파일**:
- 신규: `Timeline.tsx`, `MyReservationList.tsx`
- 수정: `ReservationStatusPage/index.tsx`

---

### Step 5. 예약하기 페이지 컴포넌트 분리

**목표**: `RoomBookingPage`를 선언적 컴포넌트 조합으로 재구성한다.

**작업 내용**:

1. `src/pages/RoomBookingPage/useBookingFilters.ts`
   - URL 쿼리 파라미터 ↔ 필터 상태 동기화 훅
   - 입력 검증 로직 포함
   - 반환: `{ filters, setFilter, validationError, isFilterComplete }`

2. `src/pages/RoomBookingPage/useAvailableRooms.ts`
   - 필터 조건 기반 가용 회의실 계산 (이 페이지에서만 사용하므로 페이지에 co-locate)
   - 필터링 조건에 명확한 이름 부여:
     ```tsx
     const hasEnoughCapacity = room.capacity >= attendees;
     const hasRequiredEquipment = required.every(eq => room.equipment.includes(eq));
     const isOnPreferredFloor = preferredFloor === null || room.floor === preferredFloor;
     const hasNoTimeConflict = !conflicts(room.id, reservations, date, start, end);
     ```
   - 반환: `{ availableRooms }`

3. `src/pages/RoomBookingPage/FilterPanel.tsx`
   - 예약 조건 입력 폼 (날짜, 시간, 인원, 장비, 층)
   - 장비 토글 버튼 포함 (이 페이지에서만 사용하는 UI)
   - Props: `filters`, `onChange`, `floors`

4. `src/pages/RoomBookingPage/AvailableRoomList.tsx`
   - 예약 가능 회의실 목록 + 선택 UI
   - 개별 회의실 카드 렌더링 포함
   - Props: `rooms`, `selectedRoomId`, `onSelect`

5. `src/pages/RoomBookingPage/index.tsx` 리팩토링

**목표 구조**:

```tsx
function RoomBookingPage() {
  const { filters, setFilter, validationError, isFilterComplete } = useBookingFilters();
  const { rooms, floors } = useRooms();
  const { reservations } = useReservations(filters.date);
  const { availableRooms } = useAvailableRooms(rooms, reservations, filters);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  return (
    <>
      <BackButton />
      <PageHeader title="예약하기" />
      <FilterPanel filters={filters} onChange={setFilter} floors={floors} />
      {isFilterComplete && (
        <AvailableRoomList
          rooms={availableRooms}
          selectedRoomId={selectedRoomId}
          onSelect={setSelectedRoomId}
        />
      )}
      <BookingConfirmButton roomId={selectedRoomId} filters={filters} />
    </>
  );
}
```

**완료 기준**: 기존 테스트 전체 통과, `RoomBookingPage/index.tsx` 100줄 이내

**변경 파일**:
- 신규: `useBookingFilters.ts`, `useAvailableRooms.ts`, `FilterPanel.tsx`, `AvailableRoomList.tsx`
- 수정: `RoomBookingPage/index.tsx`

---

### Step 6. 테스트 보강 및 최종 정리

**목표**: 리팩토링으로 추출된 각 단위에 대한 테스트를 추가하고, 접근성 및 코드를 최종 점검한다.

**작업 내용**:

1. 유틸리티 함수 단위 테스트
   - `formatDate`, `timeToMinutes` 등

2. 필터링 로직 단위 테스트
   - `useAvailableRooms`의 수용 인원, 장비, 층, 시간 충돌 검사

3. 접근성 점검
   - `aria-label`, `role` 속성 확인 (기존 테스트가 의존하는 속성 유지)
   - 시맨틱 HTML 요소 사용 확인

4. 기존 통합 테스트(easy/hard) 최종 확인
   - 리팩토링 후에도 동일한 사용자 시나리오가 통과하는지 확인

5. 불필요한 코드 정리
   - 사용하지 않는 import 제거

**완료 기준**: 전체 테스트 통과, 핵심 비즈니스 로직에 대한 단위 테스트 존재, ESLint 경고 없음

---

## 파일 구조 (최종 목표)

```
src/pages/
├── constants.ts                      # 공유 상수 (EQUIPMENT_LABELS, TIME_SLOTS 등)
├── utils.ts                          # 공유 유틸 (formatDate, timeToMinutes)
├── http.ts                           # Axios 래퍼 (기존 유지)
├── remotes.ts                        # API 호출 함수 (_tosslib 타입 사용)
├── Routes.tsx                        # 라우트 정의 (기존 유지)
├── PageLayout.tsx                    # 레이아웃 (기존 유지)
│
├── hooks/
│   ├── useRooms.ts                   # 회의실 목록 조회
│   ├── useReservations.ts            # 예약 현황 조회
│   ├── useMyReservations.ts          # 내 예약 조회 + 취소
│   └── useCreateReservation.ts       # 예약 생성
│
├── components/
│   ├── DateInput.tsx                 # 날짜 입력
│   ├── MessageBanner.tsx             # 성공/에러 메시지 배너
│   ├── SectionHeader.tsx             # 섹션 헤더 + 카운트
│   └── EmptyState.tsx                # 빈 상태 메시지
│
├── ReservationStatusPage/
│   ├── index.tsx                     # 페이지 (조합 레이어, ~80줄)
│   ├── Timeline.tsx                  # 타임라인 시각화 (툴팁 포함)
│   └── MyReservationList.tsx         # 내 예약 목록
│
└── RoomBookingPage/
    ├── index.tsx                     # 페이지 (조합 레이어, ~80줄)
    ├── useBookingFilters.ts          # 필터 상태 + URL 동기화 훅
    ├── useAvailableRooms.ts          # 필터 기반 가용 회의실 계산
    ├── FilterPanel.tsx               # 예약 조건 입력 폼 (장비 토글 포함)
    └── AvailableRoomList.tsx         # 예약 가능 회의실 목록 (카드 포함)
```

---

## 스텝별 의존 관계

```
Step 0 (환경 정비)
  └─→ Step 1 (상수/유틸 추출)
        ├─→ Step 2 (커스텀 훅)
        └─→ Step 3 (공유 UI 컴포넌트)
              │
        Step 2 + Step 3 완료 후:
              ├─→ Step 4 (예약 현황 페이지 분리)
              └─→ Step 5 (예약하기 페이지 분리)  ← Step 4와 병렬 가능
                    │
              Step 4 + Step 5 완료 후:
                    └─→ Step 6 (테스트 보강 + 최종 정리)
```

- Step 2와 Step 3은 서로 독립적이므로 병렬 진행 가능합니다.
- Step 4와 Step 5는 서로 독립적이므로 병렬 진행 가능합니다.
- Step 4/5는 Step 2(훅)와 Step 3(공유 컴포넌트) 모두 완료 후 진행합니다.

---

## 각 스텝의 안전망

모든 스텝은 다음을 보장합니다:

1. **기존 테스트 통과** — 리팩토링이 기능을 깨뜨리지 않음
2. **점진적 변경** — 한 스텝에서 너무 많은 파일을 동시에 수정하지 않음
3. **독립적 커밋 가능** — 각 스텝이 완료되면 독립적으로 커밋할 수 있는 상태
