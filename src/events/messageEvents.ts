import { Interaction, Message } from "discord.js"
import { Event } from "src/decorators"
import { commandRegistry } from "src/decorators/command";
import { serviceManager } from "src/services/serviceManager";

const logger = serviceManager.getLogger();

export const COMMAND_PREFIX = process.env.COMMAND_PREFIX || "^"

/**
 * Handles message and interaction events for the bot.
 * This class listens for specific Discord events and processes commands or interactions accordingly.
 */
export default class MessageEvents {

    @Event('messageCreate')
    onMessage(message: Message): void {
        if (message.author.bot) return;

        if (!message.content.startsWith(COMMAND_PREFIX)) return;

        const args = message.content
            .slice(COMMAND_PREFIX.length)
            .trim()
            .split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (command && commandRegistry.has(command)) {
            commandRegistry.get(command)?.(message, args);
        } else {
            message.reply(`Unknown command: ${command}`);
        }
    }

    @Event('interactionCreate')
    async onInteraction(interaction: Interaction): Promise<void> {

    }
       
}
