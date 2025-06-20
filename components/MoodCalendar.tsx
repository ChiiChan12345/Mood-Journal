import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MoodEntry } from '../utils/storage';

interface MoodCalendarProps {
  entries: MoodEntry[];
  onDayPress?: (date: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const screenWidth = Dimensions.get('window').width;
const DAY_SIZE = (screenWidth - 64) / 7; // 32px padding on each side

export default function MoodCalendar({ entries, onDayPress }: MoodCalendarProps) {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const getMonthData = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(selectedMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date.split('T')[0] === dateStr);
      days.push({ day, entry });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  const renderDay = (dayData: { day: number; entry?: MoodEntry } | null, index: number) => {
    if (!dayData) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const { day, entry } = dayData;
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.day,
          entry && { backgroundColor: entry.color || '#eee' }
        ]}
        onPress={() => onDayPress?.(dateStr)}
      >
        <Text style={[
          styles.dayText,
          entry && { color: '#fff' }
        ]}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Text style={styles.navigationButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Text style={styles.navigationButton}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {DAYS.map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {getMonthData().map((day, index) => renderDay(day, index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navigationButton: {
    fontSize: 24,
    color: '#007AFF',
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DAY_SIZE / 2,
    margin: 1,
  },
  emptyDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
}); 