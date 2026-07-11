import { SidebarHistory } from "@/components/sidebar-history";
import { ResponsiveLayout } from "@/components/responsive-layout";

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
