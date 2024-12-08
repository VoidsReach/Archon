import { bootstrap, client } from "./bootstrap";
import { registerAllEvents } from "./handlers/eventRegistry";
import { serviceManager } from "./services/serviceManager";

(async () => {
    try {
        await bootstrap();
        serviceManager.getLogger().success("Archon Bootrap Complete");

        // Register all events
        registerAllEvents(client);
    } catch (error) {
        console.error('Failed to start the bot: ', error);
    }
})();