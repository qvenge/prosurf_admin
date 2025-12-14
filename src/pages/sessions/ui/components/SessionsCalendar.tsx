import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import clsx from 'clsx';
import { CaretLeftBold, CaretRightBold } from '@/shared/ds/icons';
import { IconButton } from '@/shared/ui';
import { useSessions, type Session } from '@/shared/api';
import { formatTime } from '@/shared/lib/format-utils';
import styles from './SessionsCalendar.module.scss';

const WEEKDAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  dateKey: string;
}

export interface SessionsCalendarProps {
  eventType?: string;
  eventId?: string | null;
  status?: 'SCHEDULED' | 'CANCELLED' | 'COMPLETE';
  className?: string;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // Convert to Monday-based (0 = Monday, ..., 6 = Sunday)
  let startDayOfWeek = firstDayOfMonth.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Add days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const date = new Date(prevMonthYear, prevMonth, dayNumber);
    const dayOfWeek = (startDayOfWeek - i - 1 + 7) % 7;
    days.push({
      date,
      dayNumber,
      isCurrentMonth: false,
      isWeekend: dayOfWeek >= 5,
      dateKey: formatDateKey(date),
    });
  }

  // Add days of current month
  const daysInMonth = lastDayOfMonth.getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = (startDayOfWeek + day - 1) % 7;
    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isWeekend: dayOfWeek >= 5,
      dateKey: formatDateKey(date),
    });
  }

  // Add days from next month to fill the grid (always 6 rows = 42 days total)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const remainingDays = 42 - days.length;

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(nextMonthYear, nextMonth, day);
    const dayOfWeek = (days.length) % 7;
    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      isWeekend: dayOfWeek >= 5,
      dateKey: formatDateKey(date),
    });
  }

  return days;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type SessionType = 'training' | 'tour' | 'activity';

function getSessionType(session: Session): SessionType {
  const labels = session.event.labels ?? [];
  if (labels.includes('tour')) return 'tour';
  if (labels.includes('activity')) return 'activity';
  return 'training';
}

export function SessionsCalendar({ eventType, eventId, status, className }: SessionsCalendarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // Calculate date range for API query
  const firstVisibleDate = calendarDays[0].date;
  const lastVisibleDate = calendarDays[calendarDays.length - 1].date;

  // Set time to start/end of day for proper filtering
  const startsAfter = new Date(firstVisibleDate);
  startsAfter.setHours(0, 0, 0, 0);

  const endsBefore = new Date(lastVisibleDate);
  endsBefore.setHours(23, 59, 59, 999);

  const { data: sessionsData, isLoading } = useSessions({
    startsAfter: startsAfter.toISOString(),
    endsBefore: endsBefore.toISOString(),
    'labels.any': eventType ? [eventType] : undefined,
    eventId: eventId || undefined,
    limit: 200,
  });

  // Group sessions by date (with status filter applied on client)
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>();

    if (!sessionsData?.items) return map;

    for (const session of sessionsData.items) {
      // Filter by status on client side
      if (status && session.status !== status) {
        continue;
      }

      const sessionDate = new Date(session.startsAt);
      const dateKey = formatDateKey(sessionDate);

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(session);
    }

    // Sort sessions by time within each day
    for (const sessions of map.values()) {
      sessions.sort((a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
    }

    return map;
  }, [sessionsData, status]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    searchParams.set('sessionId', sessionId);
    setSearchParams(searchParams);
  };

  // Split days into weeks (rows of 7)
  const weeks = useMemo(() => {
    const result: CalendarDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <div className={clsx(styles.calendar, className)}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.monthTitle}>
          {MONTH_NAMES[currentMonth]}, {currentYear}
        </h2>
        <div className={styles.navigation}>
          <IconButton
            src={CaretLeftBold}
            type="secondary"
            size="s"
            onClick={handlePrevMonth}
          />
          <IconButton
            src={CaretRightBold}
            type="secondary"
            size="s"
            onClick={handleNextMonth}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={styles.grid}>
        {/* Weekday Headers */}
        <div className={styles.weekdayRow}>
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={clsx(
                styles.weekdayCell,
                index >= 5 && styles.weekdayCellWeekend
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className={styles.weekRow}>
            {week.map((day) => {
              const daySessions = sessionsByDate.get(day.dateKey) ?? [];

              return (
                <div
                  key={day.dateKey}
                  className={clsx(
                    styles.dayCell,
                    !day.isCurrentMonth && styles.dayCellOutside
                  )}
                >
                  <span
                    className={clsx(
                      styles.dayNumber,
                      !day.isCurrentMonth && styles.dayNumberOutside
                    )}
                  >
                    {day.dayNumber}
                  </span>

                  {daySessions.length > 0 && (
                    <div className={styles.badges}>
                      {daySessions.map((session) => (
                        <button
                          key={session.id}
                          className={clsx(
                            styles.badge,
                            !day.isCurrentMonth && styles.badgeOutside,
                            day.isCurrentMonth && getSessionType(session) === 'tour' && styles.badgeAccent,
                            day.isCurrentMonth && getSessionType(session) === 'activity' && styles.badgeSuccess
                          )}
                          onClick={() => handleSessionClick(session.id)}
                        >
                          {session.event.title} {formatTime(session.startsAt)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Loading overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            Загрузка...
          </div>
        )}
      </div>
    </div>
  );
}
