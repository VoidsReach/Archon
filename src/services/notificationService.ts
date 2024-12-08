import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { Logger } from "./logging/logger";
import { serviceManager } from "./serviceManager";
import { ChannelEvents, ChannelMappingService } from "./channelEventRegistry";

interface NotificationConfig {
    client: Client;
    channelMapper: ChannelMappingService;
}

// TODO validation
interface AnnouncementOptions {
    title: string;
    description: string;
    fields?: { name: string; value: string }[];
    color?: number;
    footer?: string;
    timestamp?: boolean
}

/**
 * Singleton class responsible for managing discord notifications/messages/announcements.
 */
export class NotificationService {
    private static _instance: NotificationService | null = null;
    private logger: Logger = serviceManager.getLogger();
    private client: Client;

    private channelMapper: ChannelMappingService;
    
    constructor(config: NotificationConfig) {
        this.client = config.client;
        this.channelMapper = config.channelMapper;
    }

    public static initialize(config: NotificationConfig): void {
        if (this._instance) {
            throw new Error("NotificationService has already been initialized");
        }
        this._instance = new NotificationService(config);
    }

    /**
     * Retrieves the singleton instance of NotificationService.
     * @throws {Error} If the NotificationService has not been initialized.
     * @returns {NotificationService} The singleton instance.
     */
    public static getInstance(): NotificationService {
        if (!this._instance) {
            throw new Error("NotificationService has not been initialized");
        }
        return this._instance;
    }

    /**
     * Gets the appropriate channel for an event.
     * Falls back to default if no override is set.
     * @param event The event name (optional).
     * @returns {Promise<TextChannel | null>} The resolved text channel or null if no valid channel is found.
     */
    private async getChannel(event?: keyof ChannelEvents): Promise<TextChannel | null> {
        const mappings = this.channelMapper.getChannelMappings();
        const channelId = event ? mappings.events[event] : mappings.default;

        if (!channelId) {
            this.logger.warn(`No channel ID found for event "${event || "default"}"`);
            return null;
        }

        const cachedChannel = this.client.channels.cache.get(channelId);
        if (cachedChannel?.isTextBased()) {
            return cachedChannel as TextChannel;
        }

        try {
            const fetchedChannel = await this.client.channels.fetch(channelId);
            if (fetchedChannel?.isTextBased) {
                return fetchedChannel as TextChannel;
            } else {
                this.logger.warn(`NotificationService: Channel with ID ${channelId} is not text-based`);
            }
        } catch (error) {
            this.logger.error( `NotificationService: Failed to fetch channel with ID "${channelId}`, error);
        }

        return null;
    }

    /**
     * Sends an embed announcement to a specific event channel or default channel.
     * @remarks
     * Use this for rich announcements, such as server updates or alerts.
     * @param event The event name (optional).
     * @param options The announcement options.
     */
    public async sendAnnouncement(event: keyof ChannelEvents | undefined, options: AnnouncementOptions): Promise<void> {
        const channel = await this.getChannel(event);

        if (!channel) {
           this.logger.warn(`NotificationSevice: No valid channel found for event "${event || "default"}"`);
           return;
        }

        const embed = new EmbedBuilder()
            .setTitle(options.title)
            .setDescription(options.description)
            .setColor(options.color || 0x00ff00);

        if (options.footer) {
            embed.setFooter({ text: options.footer });
        }

        if (options.timestamp) {
            embed.setTimestamp();
        }

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            this.logger.error("NotificationService: Unexpected error while sending message.", {
                event,
                channel,
                error
            });
        }
    }

    // TODO attachments

    /**
     * Sends a plain message to a specific event channel or default channel.
     * @param event The event name (optional)
     * @param message The message content
     */
    public async sendMessage(event: keyof ChannelEvents | undefined, message: string): Promise<void> {
        const channel = await this.getChannel(event);

        if (!channel) {
            this.logger.warn(`NotificationService: No valid channel found for event "${event || "default"}"`);
            return;
        }

        try {
            await channel.send(message);
        } catch (error) {
            this.logger.error("NotificationService: Unexpected error while sending message.", {
                event,
                channel,
                error
            });
        }
    }


}