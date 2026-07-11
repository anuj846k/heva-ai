import { SidebarHistory } from "@/components/sidebar-history";
import { ResponsiveLayout } from "@/components/responsive-layout";

export const dynamic = 'force-dynamic';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResponsiveLayout sidebar={<SidebarHistory />}>
      {children}
    </ResponsiveLayout>
  );
}
