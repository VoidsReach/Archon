import { Request, Response } from "express";
import { serviceManager } from "src/services/serviceManager";

export default async function clockifyHandler(req: Request, res: Response): Promise<void> {
    const logger = serviceManager.getLogger();
    const notifService = serviceManager

    const { currentlyRunning, timeInterval, user } = req.body;
    
    if (currentlyRunning) {
        logger.debug(`[Clockify] Time entry started by ${user.name} at ${timeInterval.start}`);
    } else if (timeInterval.end) {
        logger.debug(`[Clockify] Time entry stopped by ${user.name} at ${timeInterval.start}`);
    } else {
        logger.warn('[Clockify] Unhandled time entry state.');
    }

    res.status(200).send('Clockify webhook processed.');

}