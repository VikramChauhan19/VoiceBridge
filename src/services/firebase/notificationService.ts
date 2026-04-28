import { firestore } from "@/src/services/firebase/firebaseConfig";
import { PushTokenRecord } from "@/src/services/firebase/types";
import { collection } from "firebase/firestore";
import { Platform } from "react-native";

const pushTokensCollection = collection(firestore, "pushTokens");

function getNotificationPlatform(): PushTokenRecord["platform"] {
  if (
    Platform.OS === "ios" ||
    Platform.OS === "android" ||
    Platform.OS === "web"
  ) {
    return Platform.OS;
  }
  return "web";
}

export async function registerDeviceForPushNotifications(
  uid: string,
): Promise<string | null> {
  console.log("Push notifications disabled for Expo Go:", uid);
  return null;
}
