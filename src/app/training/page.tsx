import { verifySession } from '@/lib/dal';
import TrainingClient from './TrainingClient';

export default async function TrainingPage() {
  await verifySession();

  return <TrainingClient />;
}
