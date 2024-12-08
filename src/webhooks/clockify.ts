import { Request, Response } from "express";
import { serviceManager } from "src/services/serviceManager";


export default function clockifyHandler(req: Request, res: Response): void {
    const { event, data } = req.body;
    serviceManager.getLogger().info(`[Clockify] Event: ${event} Data: ${data}`);
    res.status(200).send('Clockify webhook processed.');
}