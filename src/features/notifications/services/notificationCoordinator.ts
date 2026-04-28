import {
  registerDeviceForPushNotifications,
  subscribeForegroundNotifications,
} from '@/src/services/firebase/notificationService';

export async function prepareNotifications(uid: string): Promise<string | null> {
  return registerDeviceForPushNotifications(uid);
}

export function listenNotifications(
  handler: (payload: { title: string; body: string }) => void
): ReturnType<typeof subscribeForegroundNotifications> {
  return subscribeForegroundNotifications((title, body) => handler({ title, body }));
}
