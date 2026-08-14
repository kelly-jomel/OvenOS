import { redirect } from 'next/navigation';

export default function LandingPage() {
  // Completely bypass the landing page and go straight to the login screen
  redirect('/login');
}
