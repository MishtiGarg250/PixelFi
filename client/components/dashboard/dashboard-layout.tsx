import { AppShell } from "@/components/layout/app-shell";

export const DashboardLayout = ({children}:{children:React.ReactNode}) => {
  return <AppShell>{children}</AppShell>;
};
