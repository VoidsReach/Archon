import { REST, Routes } from "discord.js";
import { importFiles } from "../io/fileScanner"
import { serviceManager } from "../services/serviceManager";
import { Logger } from "../services/logging/logger";

const logger: Logger = serviceManager.getLogger();

export const slashCommands: any[] = [];

/**
 * Dynamically load all slash commands from the specified directory.
 * Validates and stores commands in the `slashCommands` array.
 */
export async function loadSlashCommands(): Promise<void> {
    const modules = await importFiles("../commands/slashCommands");

    for (const module of modules) {
        if (module.name && module.run) {
            slashCommands.push(module);
            logger.verbose(`Loaded slash command: ${module.name}`);
        } else {
            logger.warn("Skipped invalid command module.");
        }
    }
    
    logger.info(`${slashCommands.length} slash commands loaded:`);
}

/**
 * Register all slash commands with Discord.
 * @param slashCommands Array of loaded slash command modules
 */
export async function registerSlashCommands(slashCommands: any[]): Promise<void> {
    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN || "");

    try {
        logger.info("Registering slash commands...");
    
        const payload = slashCommands.map((cmd) => ({
            name: cmd.name,
            description: cmd.description,
            options: cmd.options || []
        }));

        // TODO proper guild
        await rest.put(Routes.applicationGuildCommands(
            process.env.CLIENT_ID || "",
            process.env.DEV_GUILD_ID || ""
        ), {
            body: payload
        });

        logger.success("Slash commands registered successfully!");
    } catch (error) {
        logger.error("Failed to register slash commands:", error)
    }
}