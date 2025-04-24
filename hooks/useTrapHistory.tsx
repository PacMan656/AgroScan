import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@trap_history';

export async function addTrapEvent(event: string) {
  const now = new Date().toLocaleString('pt-BR');
  const newEntry = { time: now, message: event };

  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  const history = existing ? JSON.parse(existing) : [];

  history.unshift(newEntry); // adiciona no topo
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export async function getTrapHistory(): Promise<{ time: string; message: string }[]> {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  return existing ? JSON.parse(existing) : [];
}

export async function clearTrapHistory() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
