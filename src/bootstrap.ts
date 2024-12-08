import dotenv from "dotenv";
// Load envs
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
import { serviceManager } from "./services/serviceManager";

// Initialize client instance
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const logger = serviceManager.getLogger();

export async function bootstrap(): Promise<void> {
    logger.info("Bootstrapping Archon...")
    try {
        // Initialize Managed Services
        logger.debug("Initializing Service Manager..");
        await serviceManager.initialize(client);
        
        // Login to the Discord Client
        logger.debug("Logging into Discord..");
        client.login(process.env.BOT_TOKEN);
    } catch (error) {
        logger.error("Failed to bootstrap bot:", error);
    }
}