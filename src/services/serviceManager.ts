import { Client } from "discord.js";

/**
 * Singleton class responsible for managing and initializing services for the bot.
 */
class ServiceManager {

    private static instance: ServiceManager | null = null;
    private initialized = false;

    private client: Client | null = null;

    private constructor() {};

    /**
     * Retrieves the singleton instance of the ServiceManager.
     * @returns {ServiceManager} The singleton instance.
     */
    public static getInstance(): ServiceManager {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }

    /**
     * Initializes the ServiceManager and sets up client-related services.
     * This should be called during bot startup.
     * @param {Client} client - The Discord.js client instance.
     * @returns {Promise<void>} A promise that resolves once initialization is complete.
     */
    public async initialize(client: Client): Promise<void> {
        this.client = client;

        // Client ready bootstrap
        client.once("ready", async () => {
            await this.setupClientServices(client);
            this.initialized = true;
        });
    }

    /**
     * Internal method to set up services dependent on the Discord client.
     * Throws an error if services are already initialized.
     * @private
     * @param {Client} client - The Discord.js client instance.
     */
    private async setupClientServices(client: Client): Promise<void> {
        // TODO
    }

}

export const serviceManager: ServiceManager = ServiceManager.getInstance();