import { Slot } from 'expo-router';
import HamburgerMenu from '../../components/ui/HamburgerMenu'; // Ensure the file exists at this path or adjust the path accordingly

export default function AppLayout() {
  return (
    <HamburgerMenu>
      <Slot />
    </HamburgerMenu>
  );
}