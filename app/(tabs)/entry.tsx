import { useLocalSearchParams } from 'expo-router';
import EntryScreen from '../../screens/EntryScreen';

export default function Entry() {
  const { id, date } = useLocalSearchParams<{ id: string; date: string }>();
  return <EntryScreen entryId={id} date={date} />;
} 