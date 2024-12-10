import { ApplicationCommandOptionType } from "discord.js";
import { serviceManager } from "../../services/serviceManager";

/**
 * Slash command: Hug
 * Allows a user to "hug" another user on the server with an optional reason and ping option.
 */
module.exports = {
    name: "hug",
    description: "Hug a user on the server",
    options: [
        {
            name: "user",
            description: "The user to hug",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            description: "Reason for the hug",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "ping",
            description: "Whether to ping the hugged user",
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ],
    run: async (
        _client: any,
        interaction: any
    ) => {
        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") || "Well... why not?!";
        const ping = interaction.options.getBoolean("ping") || false;

        const message: string = `${interaction.user.username} gives a warm hug to ${
                ping ? `<@${user.id}>` : user.username
            }! Why? ${reason}`;

        serviceManager.getLogger().verbose(message, `\nPinged? ${ping}.`)
        await interaction.reply(message);
    }
};