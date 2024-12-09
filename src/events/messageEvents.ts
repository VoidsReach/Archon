import { Interaction, Message } from "discord.js"
import { Event } from "src/decorators"
import { commandRegistry } from "src/decorators/command";
import { slashCommands } from "src/handlers/slashHandler";
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
        } // ignore incorrect commands
    }

    @Event('interactionCreate')
    async onInteraction(interaction: Interaction): Promise<void> {
        if (!interaction.isCommand()) return;

        const command = slashCommands.find((cmd) => cmd.name === interaction.commandName);
        if (!command) {
            await interaction.reply({ content: "Command not found!", ephemeral: true });
            logger.debug("Failed command attempted: ${}")
            return;
        }

        try {
            await command.run(interaction.client, interaction);
        } catch (error) {
            logger.error(`Error executing "${command.name}": ${error}`);
            await interaction.reply({
                content: "An error occurred while executing the command.",
                ephemeral: true
            });
        }
    }
       
}
