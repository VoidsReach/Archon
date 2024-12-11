import { Collection, Message, PermissionResolvable } from "discord.js";
import { serviceManager } from "../services/serviceManager";

export const commandRegistry = new Collection<string, (message: Message, args: string[]) =>void>();

interface CommandOptions {
    permissions?: PermissionResolvable[];
}

/**
 * Command Decorator
 * @param name Name of the command
 */
export function Command(name: string, options?: CommandOptions): MethodDecorator {
    return (target, propertyKey, descriptor: TypedPropertyDescriptor<any>) => {
        if (!descriptor || typeof descriptor.value !== 'function') {
            throw new Error(`Command "${name}" must decorate a method.`);
        }
        const className = target.constructor.name;
        serviceManager.getLogger().verbose(`Registering command "${name}" from class "${className}" - method: "${String(propertyKey)}"`);

        const commandFunction = descriptor.value as (message: Message, args: string[]) => void;
    

        // Add the decorated method to the registry
        commandRegistry.set(name, (message, args) => {
            if (options?.permissions) {
                const missingPermissions = options.permissions.filter(
                    perm => !message.member?.permissions.has(perm)
                );

                if (missingPermissions.length > 0) {
                    message.reply(
                        `You lack the following permissions to use this command: ${missingPermissions.join(', ')}`
                    );
                    return;
                }
            }

            // debug
            serviceManager.getLogger().verbose(`Executing command "${name}" with args: [${args.join(', ')}]`);
            commandFunction(message, args);
        });
    }
}