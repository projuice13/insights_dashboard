import { verifySession } from '@/lib/dal';
import CreateOrderClient from './CreateOrderClient';

export default async function CreateOrderPage() {
  await verifySession();
  return <CreateOrderClient />;
}
