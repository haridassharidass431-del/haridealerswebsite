import { cookies } from 'next/headers';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) return <AdminLogin />;

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
