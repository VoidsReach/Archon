import { bootstrap } from "./bootstrap";
import { serviceManager } from "./services/serviceManager";

(async () => {
    try {
        await bootstrap();
        serviceManager.getLogger().success("Archon Bootrap Complete");
    } catch (error) {
        console.error('Failed to start the bot: ', error);
    }
})();