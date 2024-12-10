import 'module-alias/register';
import { bootstrap } from "./bootstrap";
import { initializeCommands } from "./handlers/commandHandler";
import { registerAllEvents } from "./handlers/eventHandler";
import { loadSlashCommands, registerSlashCommands, slashCommands } from "./handlers/slashHandler";
import { registerWebhooks } from "./handlers/webhookHandler";
import { serviceManager } from "./services/serviceManager";
import express, { Router } from 'express';

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
        const webhookRouter = Router();
        const webhookPort = process.env.WEBHOOK_PORT || 3030;

        app.use(express.json());
        registerWebhooks(webhookRouter);

        app.use('/webhook', webhookRouter);
        app.listen(webhookPort, () => serviceManager
            .getLogger()
            .info(`Bot is listening for webhooks on port: ${webhookPort}`));
    } catch (error) {
        console.error('Failed to start the bot: ', error);
    }
})();