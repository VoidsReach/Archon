import fs from "fs";
import path from "path";
import { Logger } from "./logging/logger";

/**
 * Represents the event-channel mappings for the bot, handling default values,
 * file-based persistence, and runtime modifications.
 */
export type ChannelEvents = {
    log_event: string;
    server_announcement: string;
    dev_commands: string,
    clockify_events: string;
}

/**
 * Represents the structure of channel mappings, including event-specific channels and a default fallback channel.
 */
interface ChannelMappings {
    /** Mapping of specific events to their respective channel IDs */
    events: ChannelEvents;
    /** Default channel ID */
    default: string;
}

/**
 * Service responsible for managing channel mappings, including loading, resetting,
 * and overriding channel configurations. Mappings are persisted in a JSON file.
 */
export class ChannelMappingService {
    private readonly filePath: string = path.resolve("./config/channelMappings.json");
    private readonly logger: Logger;
    private readonly defaultChannelMappings: ChannelMappings;

    private currentMappings: ChannelMappings;

    constructor(logger: Logger) {
        this.logger = logger;

        this.defaultChannelMappings = {
            events: {
                log_event: process.env.LOG_CHANNEL_ID || "",
                server_announcement: process.env.ANNOUNCEMENT_CHANNEL_ID || "",
                clockify_events: process.env.CLOCKIFY_CHANNEL_ID || "",
                dev_commands: process.env.DEV_COMMANDS_CHANNEL_ID || "",
            },
            default: process.env.DEFAULT_CHANNEL_ID || ""
        };

        this.currentMappings = this.initializeChannelMappings();
    }

    /**
     * Initializes the channel mappings file with default values if it does not already exist.
     * Ensures that all required mappings are present in the environment variables.
     *
     * @throws If required environment variables for default mappings are missing.
     */
    private initializeChannelMappings(): ChannelMappings {
        let fileMappings: ChannelMappings | null = null;

        if (fs.existsSync(this.filePath)) {
            try {
                const data = fs.readFileSync(this.filePath, "utf-8");
                fileMappings = JSON.parse(data);
            } catch (error) {
                this.logger.error("Failed to read channel mappings file. Falling back to defaults:", error);
            }
        }

        const mergedMappings = {
            events: {
                log_event: fileMappings?.events?.log_event || this.defaultChannelMappings.events.log_event,
                server_announcement: fileMappings?.events?.server_announcement || this.defaultChannelMappings.events.server_announcement,
                clockify_events: fileMappings?.events?.clockify_events || this.defaultChannelMappings.events.clockify_events, // Ensure new default gets added
                dev_commands: fileMappings?.events?.dev_commands || this.defaultChannelMappings.events.dev_commands,
            },
            default: fileMappings?.default || this.defaultChannelMappings.default,
        };

        if (!fileMappings || JSON.stringify(fileMappings) !== JSON.stringify(mergedMappings)) {
            this.saveMappingsToFile(mergedMappings);
        } 
        
        return mergedMappings;
    }

    /**
     * Saves the current in-memory mappings to the JSON file.
     * @param mappings The channel mappings to save.
     */
    private saveMappingsToFile(mappings: ChannelMappings): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(mappings, null, 4));
            this.logger.debug("Channel mappings saved to file.");
        } catch (error) {
            this.logger.error("Failed to save channel mappings to file:", error);
        }
    }

    /**
     * Gets the current in-memory channel mappings.
     * @returns The current channel mappings.
     */
    public getChannelMappings(): ChannelMappings {
        return this.currentMappings;
    }

    /**
     * Overrides the channel for a specific event.
     * @param event The event to override.
     * @param channelId The new channel ID.
     */
    public overrideEventChannel(event: keyof ChannelEvents, channelId: string): void {
        this.currentMappings.events[event] = channelId;
        this.saveMappingsToFile(this.currentMappings);
        this.logger.info(`Channel ID for event "${event}" overridden to "${channelId}".`);
    }

    /**
     * Resets the channel mapping for a specific event to its default value.
     *
     * @param event - The name of the event whose channel should be reset.
     * @throws If the specified event does not exist in the default mappings.
     */
    public resetEventChannel(event: keyof ChannelEvents): void {
        if (!this.defaultChannelMappings.events[event]) {
            throw new Error(`Event: "${event}" does not exist in default mappings`)
        }
        this.currentMappings.events[event] = this.defaultChannelMappings.events[event];
        fs.writeFileSync(this.filePath, JSON.stringify(this.currentMappings, null, 4));
        this.logger.info(`Channel ID for event "${event}" reset to default`);
    }

    /**
     * Resets all channel mappings to their default values.
     */
    public resetAllMappings(): void {
        this.currentMappings = { ...this.defaultChannelMappings };
        fs.writeFileSync(this.filePath, JSON.stringify(this.defaultChannelMappings, null, 4));
        this.logger.info("All default channel mappings set.");
    }

}