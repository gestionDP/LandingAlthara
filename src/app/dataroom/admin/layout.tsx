/**
 * Admin backoffice shell. Server-side gate: only Clerk users with
 * publicMetadata.dataroom_role === 'admin' get past this layout.
 */
import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';

/** Gate de admin (la navegación la aporta el sidebar del marco del portal). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/dataroom/sign-in');
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata?.dataroom_role !== 'admin') redirect('/dataroom');

  return <>{children}</>;
}
