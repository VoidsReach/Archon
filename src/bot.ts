import { bootstrap } from "./bootstrap";
import { initializeCommands } from "./handlers/commandHandler";
import { registerAllEvents } from "./handlers/eventHandler";
import { loadSlashCommands, registerSlashCommands, slashCommands } from "./handlers/slashHandler";
import { serviceManager } from "./services/serviceManager";
import express from 'express';
import router from "./services/webhooks";

(async () => {
    try {
        await bootstrap();
        serviceManager.getLogger().success("Archon Bootrap Complete");

        // Load and register slash commands
        await loadSlashCommands();
        await registerSlashCommands(slashCommands);

        // Register all events
        registerAllEvents(serviceManager.getClient());

        // Register all bot prefixed commands
        initializeCommands()

        // Initialize webhook routes
        const app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            serviceManager.getLogger().verbose(`Received Request: ${req.method} ${req.url}`);
            next();
        })
        app.use('/webhook', router);
        app.listen(3030, () => serviceManager.getLogger().info("Bot is listening for webhooks on port 3030"));
    } catch (error) {
        console.error('Failed to start the bot: ', error);
    }
})();