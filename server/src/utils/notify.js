import Notification from '../models/Notification.js'

/**
 * Create an in-app notification.
 * @param {string} recipientId
 * @param {string} donationId  (can be null)
 * @param {string} type        NOTIFICATION_TYPES value
 * @param {string} message
 */
export const createNotification = async (recipientId, donationId, type, message) => {
  try {
    await Notification.create({ recipient: recipientId, donation: donationId, type, message })
  } catch (err) {
    // Notifications are non-critical — log but don't crash
    console.error('[Notification error]', err.message)
  }
}
