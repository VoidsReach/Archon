import { DevCommands } from "src/commands/devCommands";
import { commandRegistry } from "src/decorators/command";
import { serviceManager } from "src/services/serviceManager";

export const commandClasses = [DevCommands];

/**
 * Initialize and register all commands.
 */
export function initializeCommands(): void {
    for (const CommandClass of commandClasses) {
        new CommandClass();
    }

    serviceManager.getLogger().info(`Registered ${commandRegistry.size} commands`);
}