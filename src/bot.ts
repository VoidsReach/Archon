import { bootstrap } from "./bootstrap";


(async () => {
    try {
        // TODO

        await bootstrap()
        console.log("Bootstrap complete");
    } catch (error) {
        console.error('Failed to start the bot: ', error);
    }
})();