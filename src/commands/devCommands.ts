import { Message } from "discord.js";
import { Command } from "src/decorators/command";

export class DevCommands {

    @Command('ping')
    ping(message: Message) {
        message.reply('$$ Pong! $$');
    }

    @Command('help')
    help(message: Message, args: string[]) {
        // TODO
        message.reply('Available commands: ping, help');
    }

    @Command('admin', { permissions: ['Administrator'] })
    adminCommand(message: Message, args: string[]) {
        message.reply('TODO You are an admin!');
    }

}