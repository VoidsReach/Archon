import { Request, Response, Router } from "express";

export type WebhookHandler = (req: Request, res: Response) => void | Promise<void>;
type WebhookEntry = { path: string; handler: WebhookHandler };
type WebhookClass = { new (): any };

export const webhookClassRegistry: WebhookClass[] = [];
export const webhookRegistery = new Map<WebhookClass, WebhookEntry[]>();

/**
 * Webhook Decorator
 * Registers a method as a webhook handler.
 * @param path The path to register the webhook on.
 */
export function Webhook(path: string): MethodDecorator {
    return (target, _, descriptor) => {
        if (!descriptor || typeof descriptor.value !== 'function') {
            throw new Error(`@Webhook decorator can only be applied to methods`);
        }
                
        const constructor = target.constructor as WebhookClass;

        if (!webhookClassRegistry.includes(constructor)) {
            webhookClassRegistry.push(constructor);
        }

        const classWebhooks = webhookRegistery.get(constructor) || [];
        classWebhooks.push({ path, handler: descriptor.value as WebhookHandler });
        webhookRegistery.set(constructor, classWebhooks);
    };
}
