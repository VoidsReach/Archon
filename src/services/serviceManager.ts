import { Client } from "discord.js";
import { Logger } from "./logging/logger";
import { NotificationService } from "./notificationService";
import { ChannelMappingService } from "./channelEventRegistry";

/**
 * Singleton class responsible for managing and initializing services for the bot.
 */
class ServiceManager {

    private static instance: ServiceManager | null = null;
    private initialized = false;

    private _logger: Logger | null = null;

    private client: Client | null = null;
    private notificationService: NotificationService | null = null;
    private channelMapper: ChannelMappingService | null = null;

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
            this._logger?.success("ServiceManager: All client services initialized!");
        });
    }

    /**
     * Internal method to set up services dependent on the Discord client.
     * Throws an error if services are already initialized.
     * @private
     * @param {Client} client - The Discord.js client instance.
     */
    private async setupClientServices(client: Client): Promise<void> {
        if (this.initialized) {
            throw new Error("Services have already been initialized");
        }

        // Channel Mapping Service
        this.channelMapper = new ChannelMappingService(this.getLogger());

        // Notification Service
        NotificationService.initialize({
            client: client,
            channelMapper: this.channelMapper
        });
    }

    /**
     * Retrieves the global Client instance.
     * Throws an error if the client is not initialized.
     * @returns {Client | null} The client instance.
     */
    public getClient(): Client {
        if (!this.client) {
            throw new Error("ServiceManager: Cannot access client before initialized");
        }
        return this.client;
    }

    /**
     * Retrieves the ChannelMappingService instance.
     * Throws an error if the client is not initialized.
     * @returns {ChannelMappingService | null} The channel mapping service instance.
     */
     public getChannelMappingService(): ChannelMappingService {
        if (!this.channelMapper) {
            throw new Error("ServiceManager: ChannelMappingsService is not initialized");
        }
        return this.channelMapper;
    }

    /**
     * Retrieves the NotificationService instance.
     * Throws an error if the client is not initialized.
     * @returns {NotificationService | null} The notification service instance.
     */
    public getNotificationService(): NotificationService {
        if (!this.initialized || !this.notificationService) {
           throw new Error("ServiceManager: Cannot access notification service before client is initialized");
        }
        return this.notificationService;
    }

    /**
     * Retrieves the Logger instance.
     * Creates a new instance if one does not exist.
     * @returns {Logger | null} The logger instance.
     */
    public getLogger(): Logger {
        if (!this._logger) {
            this._logger = new Logger({
                saveToFile: false,
                logFilePath: "" // TODO
            });
        }
        return this._logger;
    }

}

export const serviceManager: ServiceManager = ServiceManager.getInstance();