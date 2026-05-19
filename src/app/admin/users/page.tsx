import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, mustChangePass: true, createdAt: true },
    orderBy: { name: 'asc' },
  });

  const serialised = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UsersClient initialUsers={serialised} />;
}
