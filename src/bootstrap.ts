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

export async function bootstrap(): Promise<void> {
    try {
        console.log("Bootstrapping Archon...");

        await serviceManager.initialize(client);

        console.log("Logging into Discord...");
        client.login(process.env.BOT_TOKEN);  
        console.log("Login successful");   
    } catch (error) {
        console.error("Failed to bootstrap bot:", error);
    }
} 