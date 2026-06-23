import { verifySession } from '@/lib/dal';
import CreateOrderClient from './CreateOrderClient';

export default async function CreateOrderPage() {
  const session = await verifySession();
  return <CreateOrderClient isAdmin={session.role === 'admin'} />;
}
