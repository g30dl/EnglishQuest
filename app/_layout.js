import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProgressProvider } from './context/ProgressContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProgressProvider>
        <Slot />
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
