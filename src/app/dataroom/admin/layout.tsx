/**
 * Admin backoffice shell. Server-side gate: only Clerk users with
 * publicMetadata.dataroom_role === 'admin' get past this layout.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/dataroom/sign-in');
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata?.dataroom_role !== 'admin') redirect('/dataroom');

  return (
    <div>
      <nav className="mb-8 flex flex-wrap gap-1 border border-[#1c3742]/10 bg-white p-1 text-sm shadow-sm">
        {[
          ['/dataroom/admin/investors', 'Inversores'],
          ['/dataroom/admin/projects', 'Proyectos'],
          ['/dataroom/admin/nda', 'NDA'],
          ['/dataroom/admin/audit', 'Auditoría'],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 font-medium text-[#1c3742]/70 transition hover:bg-[#1c3742]/5 hover:text-[#1c3742]"
          >
            {label}
          </Link>
        ))}
        <span className="ml-auto self-center px-3 text-[10px] uppercase tracking-widest text-[#1c3742]/40">
          Backoffice
        </span>
      </nav>
      {children}
    </div>
  );
}
