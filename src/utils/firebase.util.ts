import { logger } from '../core/loggers';

let admin = null;

try {
  admin = require('firebase-admin');
} catch {
  logger.warn('[Firebase] firebase-admin not available — push notifications disabled');
}

let firebaseApp = null;

export function initFirebase() {
  if (!admin) return;
  try {
    const serviceAccount = require('../credentials/firebase.json');
    if (!serviceAccount || !serviceAccount.project_id) {
      logger.warn('[Firebase] No valid service account found — push notifications disabled');
      return;
    }
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('[Firebase] Initialized successfully');
  } catch (err) {
    logger.warn('[Firebase] Failed to initialize:', err.message);
  }
}

export async function sendPushNotification(userId: string, title: string, body: string, data: Record<string, string> = {}) {
  if (!firebaseApp || !admin) return;
  try {
    const { User } = require('../models');
    const user = await User.findByPk(userId, { attributes: ['fcmToken'] });
    if (!user || !user.fcmToken) return;
    await admin.messaging().send({
      token: user.fcmToken,
      notification: { title, body },
      data,
    });
  } catch (err) {
    logger.warn('[Firebase] Push notification failed:', err.message);
  }
}
