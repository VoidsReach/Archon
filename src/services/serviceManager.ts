import { Client } from "discord.js";
import { Logger } from "./logging/logger";
import { NotificationService } from "./notificationService";
import { ChannelMappingService } from "./channelEventRegistry";
import ClockifyService from "./integrations/clockifyService";

/**
 * Singleton class responsible for managing and initializing services for the bot.
 */
class ServiceManager {

    private static instance: ServiceManager | null = null;
    private initialized = false;
    private initializedClient = false;

    private _logger: Logger | null = null;

    private client: Client | null = null;
    private channelMapper: ChannelMappingService | null = null;

    private clockifyService: ClockifyService | null = null;

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
        if (this.initialized) {
            throw new Error('Cannot re-initialize Service Manager')
        }

        this.client = client;

        await this.setupApiServices();

        // Client ready bootstrap
        client.once("ready", async () => {
            await this.setupClientServices(client);
            this.initializedClient = true;
            this._logger?.success("ServiceManager: All client services initialized!");
        });

        this.initialized = true;
    }

    /**
     * Internal method to set up services dependent on the Discord client.
     * Throws an error if services are already initialized.
     * @private
     * @param {Client} client - The Discord.js client instance.
     */
    private async setupClientServices(client: Client): Promise<void> {
        if (this.initializedClient) {
            throw new Error("Client Services have already been initialized");
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
     * Internal method to set up API services
     */
    private async setupApiServices(): Promise<void> {
        const clockifyApiKey = process.env.CLOCKIFY_API_KEY || '';
        this.clockifyService = new ClockifyService(clockifyApiKey);
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

    public getClockifyService(): ClockifyService {
        if (!this.clockifyService) {
            throw new Error("ServiceManager: Cannot access clockify service before initialized");
        }
        return this.clockifyService;
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
        if (!this.initialized) {
           throw new Error("ServiceManager: Cannot access notification service before client is initialized");
        }
        return NotificationService.getInstance();
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