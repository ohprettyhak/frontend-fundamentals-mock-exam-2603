import { describe, test, expect } from 'vitest';
import { formatDate, timeToMinutes, getTodayString } from 'utils/date';

describe('formatDate', () => {
  test('Date 객체를 YYYY-MM-DD 형식으로 변환한다', () => {
    expect(formatDate(new Date(2026, 2, 10))).toBe('2026-03-10');
  });

  test('월과 일이 한 자리일 때 0으로 패딩한다', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('timeToMinutes', () => {
  test('09:00은 0분이다 (타임라인 시작 기준)', () => {
    expect(timeToMinutes('09:00')).toBe(0);
  });

  test('09:30은 30분이다', () => {
    expect(timeToMinutes('09:30')).toBe(30);
  });

  test('20:00은 660분이다 (11시간 × 60)', () => {
    expect(timeToMinutes('20:00')).toBe(660);
  });

  test('14:30은 330분이다', () => {
    expect(timeToMinutes('14:30')).toBe(330);
  });
});

describe('getTodayString', () => {
  test('오늘 날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
    const today = new Date();
    const expected = formatDate(today);
    expect(getTodayString()).toBe(expected);
  });
});
