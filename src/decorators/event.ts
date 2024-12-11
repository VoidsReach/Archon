import { ClientEvents } from "discord.js";
import { serviceManager } from "../services/serviceManager";

// Global event class registry
type EventClass = { new (): any }
export const eventClassRegistry: EventClass[] = []; 

type EventHandler = (...args: any[]) => void;
type EventRegistryEntry = { name: keyof ClientEvents; once: boolean; handler: EventHandler };

// Per-class event registry
export const eventRegistry = new Map<EventClass, EventRegistryEntry[]>();

/**
 * Event Decorator
 * @param name Name of the event
 * @param once Whether the event should be registered as a one-time event
 */
export function Event(name: keyof ClientEvents, once = false): MethodDecorator {
    return (target, propertyKey, descriptor: TypedPropertyDescriptor<any>): void => {
        if (!descriptor || typeof descriptor.value !== 'function') {
            throw new Error(`Event "${name}" must decorate a method`);
        }

        const constructor = target.constructor as EventClass;
        serviceManager.getLogger().verbose(`Registering Event: "${name}" from class "${constructor.name}" - method: "${String(propertyKey)}`)

        if (!eventClassRegistry.includes(constructor)) {
            eventClassRegistry.push(constructor)
        }       

        const classEvents = eventRegistry.get(constructor) || [];
        classEvents.push({ name, once, handler: descriptor.value });
        eventRegistry.set(constructor, classEvents);
    }
}