import { Client } from "discord.js";
import { Event } from "src/decorators/events";
import { serviceManager } from "src/services/serviceManager";

export default class GeneralEvents {

    @Event('ready', true)
    onReady(client: Client): void {
       serviceManager
        .getLogger()
        .success(`Archon is online as ${client.user?.tag}`);
    }

}