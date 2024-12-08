import GeneralEvents from "src/events/generalEvents";
import MessageEvents from "src/events/messageEvents";
import { Client } from "discord.js";
import { eventRegistry } from "src/decorators/event";
import { serviceManager } from "src/services/serviceManager";

export const eventClasses = [GeneralEvents, MessageEvents];

/**
 * Register all events from the centralized registry
 * @param client The Discord client
 */
export function registerAllEvents(client: Client): void {
    let totalEvents = 0;
    const totalModules = eventClasses.length;

    for (const EventClass of eventClasses) {
        const instance = new EventClass();
        const events = eventRegistry.get(EventClass) || [];

        for (const { name, once, handler } of events) {
            if (once) {
                client.once(name, handler.bind(instance));
            } else {
                client.on(name, handler.bind(instance));
            }

            serviceManager.getLogger().verbose(`Registered event: ${name} (once: ${once})`);
        }
        totalEvents += events.length;
    }
    serviceManager.getLogger().success(
        `Registered ${totalModules} event modules with a total of ${totalEvents} events.`
    );
}