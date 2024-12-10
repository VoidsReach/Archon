import { Client } from "discord.js";
import { Event } from "../decorators/event";
import { serviceManager } from "../services/serviceManager";

export default class GeneralEvents {

    @Event('ready', true)
    onReady(client: Client): void {
       serviceManager
        .getLogger()
        .success(`Archon is online as ${client.user?.tag}`);
    }

}