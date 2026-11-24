import { prisma } from './db';

export type ActivityType = 'status' | 'assignment';

/**
 * Record a single action on a customer in the activity log. Best-effort:
 * a logging failure is swallowed so it never breaks the action it describes.
 * For actions already inside a transaction, create the row in that transaction
 * instead of calling this.
 */
export async function logActivity(
  customerId: string,
  type: ActivityType,
  detail: string,
  actorName: string,
): Promise<void> {
  try {
    await prisma.customerActivity.create({ data: { customerId, type, detail, actorName } });
  } catch (e) {
    console.error('[activity] failed to log:', e);
  }
}
