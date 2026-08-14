import { redirect } from 'next/navigation';

export default function SignupPage() {
  // We've unified sign-in and sign-up. Redirect to login.
  redirect('/login');
}
