import RealmNavbar from '@/components/navbars/realmNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>
        <RealmNavbar />
      </nav>

      {children}
    </section>
  );
}
