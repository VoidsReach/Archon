import { Interaction, Message } from "discord.js"
import { Event } from "src/decorators"
import { serviceManager } from "src/services/serviceManager";

const logger = serviceManager.getLogger();

/**
 * Handles message and interaction events for the bot.
 * This class listens for specific Discord events and processes commands or interactions accordingly.
 */
export default class MessageEvents {

    @Event('messageCreate')
    onMessage(message: Message): void {
        if (message.author.bot) return;
    }

    @Event('interactionCreate')
    async onInteraction(interaction: Interaction): Promise<void> {

    }
       
}
