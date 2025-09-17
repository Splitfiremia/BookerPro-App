import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, PanResponder, PanResponderInstance, Animated, TouchableOpacity } from 'react-native';
import { useAppointments, AppointmentDetails } from '@/providers/AppointmentProvider';
import { useTeam, TeamMember } from '@/providers/TeamProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, UserSquare2, Settings } from 'lucide-react-native';

const SERVICE_COLORS: Record<string, string> = {
  Haircut: '#4F46E5',
  Color: '#0EA5E9',
  Styling: '#10B981',
  'Beard Trim': '#F59E0B',
  Massage: '#EF4444',
  Default: '#94A3B8',
};

type ViewMode = 'day' | 'week' | 'month';

interface BreakBlock { id: string; providerId: string; dayISO: string; start: number; end: number; }
interface AvailabilityDay { day: number; start: number; end: number; enabled: boolean; }
	export default function ProviderCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { appointments, updateAppointment } = useAppointments();
  const { teamMembers } = useTeam();

  const [mode, setMode] = useState<ViewMode>('week');
  const [current, setCurrent] = useState<Date>(new Date());
  const [selectedProvider, setSelectedProvider] = useState<string | 'all'>('all');
  const [breaks, setBreaks] = useState<BreakBlock[]>([]);
  const [availability, setAvailability] = useState<AvailabilityDay[]>(() =>
    Array.from({ length: 7 }, (_, d) => ({ day: d, start: 9 * 60, end: 17 * 60, enabled: d < 6 }))
  );
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.6 && appointments.length > 0) {
        const idx = Math.floor(Math.random() * appointments.length);
        const apt = appointments[idx];
        const msg = `Update: ${apt.serviceName} for ${apt.providerName} was adjusted.`;
        setBanner(msg);
        setTimeout(() => setBanner(null), 2500);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [appointments]);

  const visibleTeam: TeamMember[] = useMemo(() => {
    if (selectedProvider === 'all') return teamMembers;
    return teamMembers.filter(t => t.id === selectedProvider);
  }, [teamMembers, selectedProvider]);

  const daysInWeek = useMemo(() => getWeekDays(current), [current]);
  const daysInMonth = useMemo(() => getMonthMatrix(current), [current]);

  const onPrev = useCallback(() => {
    if (mode === 'day') setCurrent(addDays(current, -1));
    else if (mode === 'week') setCurrent(addDays(current, -7));
    else setCurrent(addMonths(current, -1));
  }, [current, mode]);
  const onNext = useCallback(() => {
    if (mode === 'day') setCurrent(addDays(current, 1));
    else if (mode === 'week') setCurrent(addDays(current, 7));
    else setCurrent(addMonths(current, 1));
  }, [current, mode]);

  const dayStart = useMemo(() => 8 * 60, []);
  const dayEnd = useMemo(() => 20 * 60, []);
  const slotHeight = 40 as const;

  const filteredAppointments = useMemo(() => {
    return appointments
      .map(augmentAppointment)
      .filter(a => isSameView(a, current, mode))
      .filter(a => (selectedProvider === 'all' ? true : a.providerId === selectedProvider));
  }, [appointments, current, mode, selectedProvider]);

  const handleDrop = useCallback(async (apt: AugmentedAppointment, targetMinutes: number, dayDate: Date, providerId?: string) => {
    try {
      const avail = availability[dayDate.getDay()];
      if (!avail?.enabled) throw new Error('Provider not available');
      const newStart = clamp(targetMinutes, avail.start, avail.end - apt.duration);
      const newEnd = newStart + apt.duration;
      const dayISO = isoDate(dayDate);
      if (hasConflict(filteredAppointments, apt.id, newStart, newEnd, dayISO, providerId ?? apt.providerId, breaks)) {
        throw new Error('Time conflicts with another appointment or break');
      }
      await updateAppointment(apt.id, {
        date: formatDay(dayDate),
        time: formatTimeRange(newStart, newEnd),
        providerId: providerId ?? apt.providerId,
        updatedAt: new Date().toISOString(),
      });
      setBanner('Appointment updated');
      setTimeout(() => setBanner(null), 2000);
    } catch (e: any) {
      const msg = `Cannot move appointment: ${e?.message ?? 'Unknown error'}`;
      console.log(msg);
      setBanner(msg);
      setTimeout(() => setBanner(null), 2500);
    }
  }, [availability, filteredAppointments, breaks, updateAppointment]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>      
      <Stack.Screen 
        options={{ 
          title: 'Provider Calendar', 
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: 10 }}
              testID="back-button"
            >
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
          )
        }} 
      />
      <Header
        mode={mode}
        setMode={setMode}
        current={current}
        onPrev={onPrev}
        onNext={onNext}
        team={teamMembers}
        selectedProvider={selectedProvider}
        onSelectProvider={setSelectedProvider}
        onOpenSettings={() => openAvailabilityEditor(availability, setAvailability, breaks, setBreaks)}
      />

      {banner ? (
        <View style={styles.banner} testID="banner">
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}

      {mode === 'month' ? (
        <MonthView
          daysMatrix={daysInMonth}
          appointments={filteredAppointments}
          current={current}
        />
      ) : null}

      {mode === 'week' ? (
        <WeekView
          days={daysInWeek}
          team={visibleTeam}
          appointments={filteredAppointments}
          dayStart={dayStart}
          dayEnd={dayEnd}
          slotHeight={slotHeight}
          onDrop={handleDrop}
          breaks={breaks}
        />
      ) : null}

      {mode === 'day' ? (
        <DayView
          day={current}
          team={visibleTeam}
          appointments={filteredAppointments}
          dayStart={dayStart}
          dayEnd={dayEnd}
          slotHeight={slotHeight}
          onDrop={handleDrop}
          breaks={breaks}
        />
      ) : null}
    </View>
  );
}

function Header({ mode, setMode, current, onPrev, onNext, team, selectedProvider, onSelectProvider, onOpenSettings }: {
  mode: ViewMode;
  setMode: (v: ViewMode) => void;
  current: Date;
  onPrev: () => void;
  onNext: () => void;
  team: TeamMember[];
  selectedProvider: string | 'all';
  onSelectProvider: (id: string | 'all') => void;
  onOpenSettings: () => void;
}) {
  return (
    <View style={styles.header} testID="calendar-header">
      <View style={styles.rowBetween}>
        <Text style={styles.title} testID="header-title">{formatHeader(current, mode)}</Text>
        <View style={styles.headerButtons}>
          <IconButton icon={<ChevronLeft color="#fff" size={18} />} onPress={onPrev} testID="prev" />
          <IconButton icon={<ChevronRight color="#fff" size={18} />} onPress={onNext} testID="next" />
          <IconButton icon={<Settings color="#fff" size={18} />} onPress={onOpenSettings} testID="settings" />
        </View>
      </View>
      <View style={styles.rowBetween}>
        <View style={styles.segment}>
          <SegmentButton active={mode === 'day'} onPress={() => setMode('day')} icon={<UserSquare2 color={mode==='day'? '#111827':'#374151'} size={16} />} label="Day" testID="seg-day" />
          <SegmentButton active={mode === 'week'} onPress={() => setMode('week')} icon={<CalendarDays color={mode==='week'? '#111827':'#374151'} size={16} />} label="Week" testID="seg-week" />
          <SegmentButton active={mode === 'month'} onPress={() => setMode('month')} icon={<LayoutGrid color={mode==='month'? '#111827':'#374151'} size={16} />} label="Month" testID="seg-month" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerChips}>
          <Chip label="All" active={selectedProvider==='all'} onPress={() => onSelectProvider('all')} testID="chip-all" />
          {team.map(t => (
            <Chip key={t.id} label={t.name} active={selectedProvider===t.id} onPress={() => onSelectProvider(t.id)} testID={`chip-${t.id}`} />
          ))}
        </ScrollView>
      </View>
      <Legend />
    </View>
  );
}

function formatHeader(current: Date, mode: ViewMode) {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] as const;
  if (mode === 'day') return `${weekdayShort(current)}, ${months[current.getMonth()]} ${current.getDate()}`;
  if (mode === 'week') {
    const days = getWeekDays(current);
    const first = days[0];
    const last = days[6];
    return `${months[first.getMonth()]} ${first.getDate()} - ${months[last.getMonth()]} ${last.getDate()}`;
  }
  return `${months[current.getMonth()]} ${current.getFullYear()}`;
}

function Legend() {
  const entries = Object.entries(SERVICE_COLORS);
  return (
    <View style={styles.legend} testID="legend">
      {entries.map(([k, v]) => (
        <View key={k} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: v }]} />
          <Text style={styles.legendText}>{k}</Text>
        </View>
      ))}
    </View>
  );
}

function SegmentButton({ active, onPress, label, icon, testID }: { active: boolean; onPress: () => void; label: string; icon: React.ReactNode; testID: string; }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.segmentBtn, active ? styles.segmentBtnActive : undefined]} testID={testID}>
      <View style={styles.segmentBtnInner}>
        <View>{icon}</View>
        <Text style={[styles.segmentLabel, active ? styles.segmentLabelActive : undefined]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Chip({ label, active, onPress, testID }: { label: string; active: boolean; onPress: () => void; testID: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active ? styles.chipActive : undefined]} testID={testID}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : undefined]}>{label}</Text>
    </TouchableOpacity>
  );
}

function IconButton({ icon, onPress, testID }: { icon: React.ReactNode; onPress: () => void; testID: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn} testID={testID}>
      <View>{icon}</View>
    </TouchableOpacity>
  );
}

function DayView({ day, team, appointments, dayStart, dayEnd, slotHeight, onDrop, breaks }: {
  day: Date;
  team: TeamMember[];
  appointments: AugmentedAppointment[];
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
  breaks: BreakBlock[];
}) {
  const columns = team.length === 0 ? [{ id: 'none', name: 'Schedule' }] : team;
  const hourMarks = useMemo(() => getHourMarks(dayStart, dayEnd), [dayStart, dayEnd]);
  const containerHeight = (dayEnd - dayStart) * (slotHeight / 30);

  return (
    <ScrollView horizontal testID="day-view">
      <View style={[styles.gridContainer, { height: containerHeight }]}>        
        <View style={styles.columnHeaderRow}>
          <View style={[styles.timeColHeader]}><Text style={styles.timeColHeaderText}>Time</Text></View>
          {columns.map((c: any) => (
            <View key={c.id} style={styles.colHeader}><Text style={styles.colHeaderText}>{'name' in c ? c.name : 'Schedule'}</Text></View>
          ))}
        </View>
        <View style={styles.row}>
          <TimeColumn dayStart={dayStart} dayEnd={dayEnd} slotHeight={slotHeight} />
          {columns.map((c: any) => (
            <DayColumn
              key={c.id}
              day={day}
              providerId={'id' in c ? c.id : undefined}
              appointments={appointments.filter(a => a.dateISO === isoDate(day) && (!c.id || a.providerId === c.id))}
              dayStart={dayStart}
              dayEnd={dayEnd}
              slotHeight={slotHeight}
              onDrop={onDrop}
              breaks={breaks.filter(b => b.providerId === (c.id || 'all') && b.dayISO === isoDate(day))}
            />
          ))}
        </View>
        {hourMarks.map(m => (
          <View key={m} pointerEvents="none" style={[styles.hourLine, { top: (m - dayStart) * (slotHeight / 30) }]} />
        ))}
      </View>
    </ScrollView>
  );
}

function WeekView({ days, team, appointments, dayStart, dayEnd, slotHeight, onDrop, breaks }: {
  days: Date[];
  team: TeamMember[];
  appointments: AugmentedAppointment[];
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
  breaks: BreakBlock[];
}) {
  const containerHeight = (dayEnd - dayStart) * (slotHeight / 30);
  const columns = days;

  return (
    <ScrollView horizontal testID="week-view">
      <View style={[styles.gridContainer, { height: containerHeight }]}>        
        <View style={styles.columnHeaderRow}>
          <View style={styles.timeColHeader}><Text style={styles.timeColHeaderText}>Time</Text></View>
          {columns.map((d) => (
            <View key={d.toISOString()} style={styles.colHeader}><Text style={styles.colHeaderText}>{formatWeekday(d)}</Text></View>
          ))}
        </View>
        <View style={styles.row}>
          <TimeColumn dayStart={dayStart} dayEnd={dayEnd} slotHeight={slotHeight} />
          {columns.map((d) => (
            <DayColumn
              key={d.toISOString()}
              day={d}
              providerId={team[0]?.id}
              appointments={appointments.filter(a => a.dateISO === isoDate(d))}
              dayStart={dayStart}
              dayEnd={dayEnd}
              slotHeight={slotHeight}
              onDrop={onDrop}
              breaks={breaks.filter(b => b.dayISO === isoDate(d))}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MonthView({ daysMatrix, appointments, current }: { daysMatrix: Date[][]; appointments: AugmentedAppointment[]; current: Date; }) {
  return (
    <View style={styles.month} testID="month-view">
      {daysMatrix.map((row, i) => (
        <View key={`r-${i}`} style={styles.monthRow}>
          {row.map(d => {
            const count = appointments.filter(a => a.dateISO === isoDate(d)).length;
            return (
              <View key={d.toISOString()} style={[styles.monthCell, !isSameMonth(d, current) ? styles.monthCellMuted : undefined]}>
                <Text style={styles.monthDay}>{d.getDate()}</Text>
                {count > 0 ? (<View style={styles.monthBadge}><Text style={styles.monthBadgeText}>{count}</Text></View>) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function TimeColumn({ dayStart, dayEnd, slotHeight }: { dayStart: number; dayEnd: number; slotHeight: number }) {
  const labels = useMemo(() => getHourLabels(dayStart, dayEnd), [dayStart, dayEnd]);
  return (
    <View style={styles.timeCol}>
      {labels.map(l => (
        <View key={l} style={[styles.timeLabel, { height: slotHeight * 2 }]}>
          <Text style={styles.timeLabelText}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

function DayColumn({ day, providerId, appointments, dayStart, dayEnd, slotHeight, onDrop, breaks }: {
  day: Date;
  providerId?: string;
  appointments: AugmentedAppointment[];
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
  breaks: BreakBlock[];
}) {
  const height = (dayEnd - dayStart) * (slotHeight / 30);
  return (
    <View style={[styles.dayCol, { height }]}>
      {breaks.map(b => (
        <View key={b.id} style={[styles.breakBlock, { top: (b.start - dayStart) * (slotHeight / 30), height: (b.end - b.start) * (slotHeight / 30) }]} />
      ))}
      {appointments.map(apt => (
        <DraggableEvent
          key={apt.id}
          apt={apt}
          day={day}
          providerId={providerId}
          dayStart={dayStart}
          dayEnd={dayEnd}
          slotHeight={slotHeight}
          onDrop={onDrop}
        />
      ))}
    </View>
  );
}

function DraggableEvent({ apt, day, providerId, dayStart, dayEnd, slotHeight, onDrop }: {
  apt: AugmentedAppointment;
  day: Date;
  providerId?: string;
  dayStart: number;
  dayEnd: number;
  slotHeight: number;
  onDrop: (apt: AugmentedAppointment, minutes: number, dayDate: Date, providerId?: string) => Promise<void>;
}) {
  const top = (apt.startMinutes - dayStart) * (slotHeight / 30);
  const height = apt.duration * (slotHeight / 30);
  const y = useRef(new Animated.Value(top)).current;
  const startY = useRef(top);
  const responder = useRef<PanResponderInstance | null>(null);

  useEffect(() => {
    startY.current = top;
    Animated.timing(y, { toValue: top, duration: 120, useNativeDriver: false }).start();
  }, [top, y]);

  const snapToMinutes = useCallback((valueY: number) => {
    const relative = Math.max(0, valueY);
    const minutes = dayStart + Math.round(relative / (slotHeight / 30)) * 30;
    return clamp(minutes, dayStart, dayEnd - apt.duration);
  }, [dayStart, dayEnd, slotHeight, apt.duration]);

  if (!responder.current) {
    responder.current = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, g) => {
        const next = startY.current + g.dy;
        y.setValue(next);
      },
      onPanResponderRelease: async (_, g) => {
        const next = startY.current + g.dy;
        const minutes = snapToMinutes(next);
        const snappedY = (minutes - dayStart) * (slotHeight / 30);
        Animated.timing(y, { toValue: snappedY, duration: 100, useNativeDriver: false }).start();
        await onDrop(apt, minutes, day, providerId);
        startY.current = snappedY;
      },
    });
  }

  const color = SERVICE_COLORS[apt.serviceName] ?? SERVICE_COLORS.Default;

  return (
    <Animated.View
      {...(responder.current as PanResponderInstance).panHandlers}
      style={[styles.event, { top: y, height, borderLeftColor: color }]}
      testID={`event-${apt.id}`}
    >
      <Text style={styles.eventTitle} numberOfLines={1}>{apt.serviceName}</Text>
      <Text style={styles.eventSub} numberOfLines={1}>{apt.providerName}</Text>
      <Text style={styles.eventTime}>{formatTimeRange(apt.startMinutes, apt.endMinutes)}</Text>
    </Animated.View>
  );
}

function openAvailabilityEditor(
  availability: AvailabilityDay[],
  setAvailability: React.Dispatch<React.SetStateAction<AvailabilityDay[]>>,
  breaks: BreakBlock[],
  setBreaks: React.Dispatch<React.SetStateAction<BreakBlock[]>>,
) {
  const today = new Date();
  setAvailability(prev => prev.map(d => d.day === today.getDay() ? { ...d, enabled: !d.enabled } : d));
  setBreaks(prev => {
    const id = `br-${Date.now()}`;
    const b: BreakBlock = { id, providerId: 'all', dayISO: isoDate(today), start: 12 * 60, end: 13 * 60 };
    const next = [...prev.filter(x => !(x.dayISO === b.dayISO && x.start === b.start && x.end === b.end)), b];
    return next;
  });
}

function augmentAppointment(a: AppointmentDetails): AugmentedAppointment {
  const { start, end } = parseTimeRange(a.time);
  const dayISO = extractISOFromDisplayDate(a.date);
  return { ...a, startMinutes: start, endMinutes: end, duration: end - start, dateISO: dayISO };
}

type AugmentedAppointment = AppointmentDetails & { startMinutes: number; endMinutes: number; duration: number; dateISO: string };

function parseTimeRange(s: string): { start: number; end: number } {
  const parts = s.split('-').map(p => p.trim());
  const toMin = (t: string) => {
    const [hm, ampm] = t.split(' ');
    const [hStr, mStr] = hm.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const H = (h % 12) + (ampm === 'PM' ? 12 : 0);
    return H * 60 + m;
  };
  return { start: toMin(parts[0] ?? '9:00 AM'), end: toMin(parts[1] ?? '9:30 AM') };
}

function formatTimeRange(start: number, end: number): string {
  return `${to12h(start)} - ${to12h(end)}`;
}

function to12h(mins: number): string {
  const H = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = H < 12 ? 'AM' : 'PM';
  const hr = H % 12 === 0 ? 12 : H % 12;
  const mm = m === 0 ? '00' : m.toString();
  return `${hr}:${mm} ${ampm}`;
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

function isSameView(a: AugmentedAppointment, current: Date, mode: ViewMode): boolean {
  const d = new Date(a.dateISO);
  if (mode === 'day') return isSameDay(d, current);
  if (mode === 'week') return isSameWeek(d, current);
  return isSameMonth(d, current);
}

function isoDate(d: Date): string { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(); }
function formatDay(d: Date): string { return `${weekdayShort(d)}, ${monthShort(d)} ${d.getDate()}`; }
function extractISOFromDisplayDate(s: string): string {
  const m = /[A-Z]{3},\s([A-Z]{3})\s(\d{1,2})/.exec(s);
  const ref = new Date();
  const monthIndex = m ? MONTHS_SHORT.indexOf(m[1] as any) : ref.getMonth();
  const day = m ? parseInt(m[2] as string, 10) : ref.getDate();
  return new Date(ref.getFullYear(), monthIndex, day).toISOString();
}

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] as const;
function monthShort(d: Date) { return MONTHS_SHORT[d.getMonth()]; }
function weekdayShort(d: Date) { return ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]; }
function formatWeekday(d: Date) { return `${weekdayShort(d)} ${d.getDate()}`; }

function getWeekDays(d: Date): Date[] {
  const start = new Date(d);
  const day = start.getDay();
  const diff = start.getDate() - day;
  const sunday = new Date(start.getFullYear(), start.getMonth(), diff);
  return Array.from({ length: 7 }, (_, i) => new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i));
}
function getMonthMatrix(d: Date): Date[][] {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) row.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i));
    weeks.push(row);
  }
  return weeks;
}
function isSameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function isSameWeek(a: Date, b: Date) {
  const aw = getWeekDays(a)[0];
  const bw = getWeekDays(b)[0];
  return isSameDay(aw, bw);
}
function isSameMonth(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth(); }

function getHourLabels(start: number, end: number) { const arr: string[] = []; for (let m = start; m < end; m += 60) arr.push(to12h(m)); return arr; }
function getHourMarks(start: number, end: number) { const arr: number[] = []; for (let m = start; m <= end; m += 60) arr.push(m); return arr; }

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth()+n); return x; }

function hasConflict(list: AugmentedAppointment[], id: string, start: number, end: number, dayISO: string, providerId: string, breaks: BreakBlock[]): boolean {
  for (const a of list) {
    if (a.id === id) continue;
    if (a.dateISO !== dayISO) continue;
    if (a.providerId !== providerId) continue;
    if (rangeOverlap(start, end, a.startMinutes, a.endMinutes)) return true;
  }
  for (const b of breaks) {
    if (b.dayISO !== dayISO) continue;
    if (b.providerId !== providerId && b.providerId !== 'all') continue;
    if (rangeOverlap(start, end, b.start, b.end)) return true;
  }
  return false;
}
function rangeOverlap(a1: number, a2: number, b1: number, b2: number) { return Math.max(a1, b1) < Math.min(a2, b2); }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: '#0B1220', gap: 8 },
  title: { color: '#F8FAFC', fontSize: 20, fontWeight: '600' as const },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8, backgroundColor: '#111827', borderRadius: 8 },
  segment: { flexDirection: 'row', backgroundColor: '#111827', borderRadius: 10, padding: 4, gap: 6 },
  segmentBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#E5E7EB' },
  segmentBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  segmentLabel: { color: '#9CA3AF', fontSize: 12 },
  segmentLabelActive: { color: '#111827' },
  providerChips: { alignItems: 'center', paddingHorizontal: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#0F172A', borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#1F2937' },
  chipActive: { backgroundColor: '#1F2937', borderColor: '#E5E7EB' },
  chipText: { color: '#9CA3AF', fontSize: 12 },
  chipTextActive: { color: '#F8FAFC' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#CBD5E1', fontSize: 12 },
  gridContainer: { paddingHorizontal: 8, paddingBottom: 24 },
  columnHeaderRow: { flexDirection: 'row' },
  timeColHeader: { width: 64, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  timeColHeaderText: { color: '#94A3B8', fontSize: 12 },
  colHeader: { width: 220, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1F2937' },
  colHeaderText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' as const },
  row: { flexDirection: 'row' },
  timeCol: { width: 64 },
  timeLabel: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#1F2937', justifyContent: 'flex-start', paddingTop: 2 },
  timeLabelText: { color: '#64748B', fontSize: 10 },
  dayCol: { width: 220, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: '#1F2937', position: 'relative' },
  hourLine: { position: 'absolute', left: 64, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#1F2937' },
  event: { position: 'absolute', left: 8, right: 8, backgroundColor: '#0F172A', borderRadius: 10, padding: 8, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  eventTitle: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' as const },
  eventSub: { color: '#94A3B8', fontSize: 11 },
  eventTime: { color: '#CBD5E1', fontSize: 10, marginTop: 4 },
  breakBlock: { position: 'absolute', left: 0, right: 0, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderStyle: 'dashed' as const },
  month: { paddingHorizontal: 12, paddingBottom: 24 },
  monthRow: { flexDirection: 'row' },
  monthCell: { flex: 1, aspectRatio: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: '#1F2937', padding: 6 },
  monthCellMuted: { backgroundColor: '#0B1326' },
  monthDay: { color: '#CBD5E1', fontSize: 12 },
  monthBadge: { marginTop: 6, backgroundColor: '#111827', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  monthBadgeText: { color: '#E5E7EB', fontSize: 10 },
  banner: { position: 'absolute', top: 6, alignSelf: 'center', backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, zIndex: 5 },
  bannerText: { color: '#06221A', fontSize: 12, fontWeight: '600' as const },
});
