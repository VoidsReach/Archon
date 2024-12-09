import { Request, Response } from "express";
import { Webhook } from "src/decorators";
import { serviceManager } from "src/services/serviceManager";
import { parseDuration } from "src/util/parsing";

/**
 * Handles incoming webhook requests from Clockify
 * Processes time entry events and sends notifications to Discord channels
 * 
 * @param req - The HTTP request object, expected to contain the Clockify payload
 * @param res - The HTTP response object, used to send status updates
 */
export class ClockifyWebhooks {

    @Webhook("/clockify/start")
    async createEntryHandler(req: Request, res: Response) {
        const logger = serviceManager.getLogger();
        const notificationService = serviceManager.getNotificationService();
        const clockifyService = serviceManager.getClockifyService()
        const { currentlyRunning, timeInterval, description, user } = req.body;

        try {
            const userDetails = await clockifyService.getUser(user.id);
            const userAvatar = userDetails.data.imageUrl || null;
            if (!currentlyRunning) {
                //TODO something wrong
            }

            logger.verbose(`[Clockify] Time entry started by ${user.name} at ${timeInterval.start}`);
            await notificationService.sendAnnouncement("clockify_events", {
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
            res.status(200).send('Clockify create webhook processed.');
        } catch (error) {
            logger.trace(`[Clockify] Failed to process webhook: `, error);
            const errorMessage = (error as Error).message || "Reason unknown";
            res.status(500).send(`Failed to process webhook: ${errorMessage}`);
        }
    }

    @Webhook("/clockify/stop")
    async stopEntryHandler(req: Request, res: Response) {
        const logger = serviceManager.getLogger();
        const notificationService = serviceManager.getNotificationService();
        const clockifyService = serviceManager.getClockifyService()
        const { timeInterval, description, user } = req.body;

        try {
            const userDetails = await clockifyService.getUser(user.id);
            const userAvatar = userDetails.data.imageUrl || null;

            const duration = timeInterval.duration
                ? parseDuration(timeInterval.duration)
                : "Unknown";

            logger.verbose(`[Clockify] Time entry stopped by ${user.name} at ${timeInterval.start}`);
            await notificationService.sendAnnouncement("clockify_events", {
                title: "Clockify: Time Entry Stopped",
                color: 0xffa500,
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
            res.status(200).send('Clockify stop webhook processed.');
        } catch (error) {
            logger.trace(`[Clockify] Failed to process webhook: `, error);
            const errorMessage = (error as Error).message || "Reason unknown";
            res.status(500).send(`Failed to process webhook: ${errorMessage}`);
        }
    }

    @Webhook("/clockify/delete")
    async deleteEntryHandler(req: Request, res: Response) {
        const logger = serviceManager.getLogger();
        const notificationService = serviceManager.getNotificationService();
        const clockifyService = serviceManager.getClockifyService();
        const { timeInterval, description, user, id, billable } = req.body;
    
        try {
            const userDetails = await clockifyService.getUser(user.id);
            const userAvatar = userDetails.data.imageUrl || null;
    
            const duration = timeInterval.duration
                ? parseDuration(timeInterval.duration)
                : "Unknown";
    
            logger.verbose(`[Clockify] Time entry deleted by ${user.name}: ID ${id}`);
            await notificationService.sendAnnouncement("clockify_events", {
                title: "Clockify: Time Entry Deleted",
                color: 0xff4500,
                fields: [
                    { name: "Description", value: description || "No Description", inline: false },
                    { name: "Duration", value: duration, inline: false },
                    { name: "Billable", value: billable ? "Yes" : "No", inline: true },
                    { name: "Entry ID", value: id || "Unknown", inline: true },
                    { name: "Deleted By", value: user.name, inline: true }
                ],
                footer: `User: ${user.name}`,
                iconURL: userAvatar,
                timestamp: true
            });
            res.status(200).send('Clockify delete webhook processed.');
        } catch (error) {
            logger.trace(`[Clockify] Failed to process webhook: `, error);
            const errorMessage = (error as Error).message || "Reason unknown";
            res.status(500).send(`Failed to process webhook: ${errorMessage}`);
        }
    }

}
