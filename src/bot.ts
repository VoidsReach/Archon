import { bootstrap, client } from "./bootstrap";
import { initializeCommands } from "./handlers/commandHandler";
import { registerAllEvents } from "./handlers/eventHandler";
import { loadSlashCommands, registerSlashCommands, slashCommands } from "./handlers/slashHandler";
import { serviceManager } from "./services/serviceManager";

(async () => {
    try {
        await bootstrap();
        serviceManager.getLogger().success("Archon Bootrap Complete");

        // Load and register slash commands
        await loadSlashCommands();
        await registerSlashCommands(slashCommands);

        // Register all events
        registerAllEvents(client);

        // Register all bot prefixed commands
        initializeCommands()

    } catch (error) {
        console.error('Failed to start the bot: ', error);
    }
})();