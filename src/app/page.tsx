import { redirect } from 'next/navigation';

export default function HomePage() {
  // Asosiy domenga kirganda to'g'ridan-to'g'ri Login sahifasiga yo'naltiramiz
  redirect('/login');
}