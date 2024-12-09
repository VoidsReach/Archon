import { Request, Response } from "express";
import { serviceManager } from "src/services/serviceManager";
import { parseDuration } from "src/util/parsing";

/**
 * Handles incoming webhook requests from Clockify
 * Processes time entry events and sends notifications to Discord channels
 * 
 * @param req - The HTTP request object, expected to contain the Clockify payload
 * @param res - The HTTP response object, used to send status updates
 */
export default async function clockifyTimeEntryHandler(req: Request, res: Response): Promise<void> {
    const logger = serviceManager.getLogger();
    const notifService = serviceManager.getNotificationService();
    const clockify = serviceManager.getClockifyService()

    const { currentlyRunning, timeInterval, description, user } = req.body; 

    try {
        const userDetails = await clockify.getUser(user.id);
        const userAvatar = userDetails.data.imageUrl || null;

        if (currentlyRunning) {
            logger.verbose(`[Clockify] Time entry started by ${user.name} at ${timeInterval.start}`);

            await notifService.sendAnnouncement("clockify_events", {
                title: "Clockify: Time Entry Started",
                color: 0x00bcd4,
                fields: [
                    { name: "Description", value: description || "No Description", inline: false },
                    { name: "Start Time", value: timeInterval.start, inline: true },
                    { name: "Currently Running", value: currentlyRunning ? "Yes" : "No", inline: true }
                ],
                footer: `User: ${user.name}`,
                iconURL: userAvatar,
                timestamp: true
            });
        } else if (timeInterval.end) {
            logger.verbose(`[Clockify] Time entry stopped by ${user.name} at ${timeInterval.start}`);

            const duration = timeInterval.duration
                ? parseDuration(timeInterval.duration)
                : "Unknown";

            await notifService.sendAnnouncement("clockify_events", {
                title: "Clockify: Time Entry Stopped",
                color: 0x4caf50,
                fields: [
                    { name: "Description", value: description || "No Description", inline: false },
                    { name: "Start Time", value: timeInterval.start, inline: true },
                    { name: "End Time", value: timeInterval.end, inline: true },
                    { name: "Duration", value: duration, inline: false }
                ],
                footer: `User: ${user.name}`,
                iconURL: userAvatar,
                timestamp: true
            });
        } else {
            logger.warn('[Clockify] Unhandled time entry state.');
        }
        
        res.status(200).send('Clockify webhook processed.');
    } catch (error) {
        logger.error(`[Clockify] Failed to process webhook: `, error);
        logger.trace(`Failed Clockify Webhook Handling`);
        const errorMessage = (error as Error).message || "Reason unknown";
        res.status(500).send(`Failed to process webhook: ${errorMessage}`);
    }

}