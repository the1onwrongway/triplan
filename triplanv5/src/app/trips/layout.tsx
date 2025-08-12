import { AppLayout } from '@/components/app-layout';

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
