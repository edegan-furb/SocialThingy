import Notification from "../models/Notification.js";

// Criar nova notificação.
export const createNotification = async (notificationData) => {
  try {
    const newNotification = new Notification(notificationData);
    await newNotification.save();
    return newNotification;
  } catch (err) {
    throw new Error(`Error while creating notification: ${err.message}`);
  }
};