import { DevCommands } from "src/commands/devCommands";
import { commandRegistry } from "src/decorators/command";
import { serviceManager } from "src/services/serviceManager";

const commandClasses = [DevCommands];

/**
 * Initialize and register all commands.
 */
export function initializeCommands(): void {
    for (const CommandClass of commandClasses) {
        new CommandClass();
    }

    serviceManager.getLogger().success(`Registered ${commandRegistry.size} commands`);
}