import { Router } from "express";
import { webhookClassRegistry, webhookRegistery } from "src/decorators";
import { serviceManager } from "src/services/serviceManager";
import { ClockifyWebhooks } from "src/webhooks/clockify";

const webhookClasses = [ClockifyWebhooks];

/**
 * Registers all webhooks in the registry with an Express router.
 * @param router The router to register webhooks with.
 */
export function registerWebhooks(router: Router): void {
    for (const webhookClass of webhookClassRegistry) {
        const instance = new webhookClass();
        const webhooks = webhookRegistery.get(webhookClass) || [];

        for (const { path, handler } of webhooks) {
            serviceManager.getLogger().verbose(`Registering webhook on path: ${path}`);
            router.post(
                path, 
                handler.bind(instance)
            );
        }
    }
}