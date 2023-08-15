import { WebhookMessageCreateOptions, WebhookMessageEditOptions } from "discord.js";
export declare class DiscordAPI {
    private static getWebhook;
    static sendWebhookMessage(name: string, data: WebhookMessageCreateOptions): Promise<void>;
    static editWebhookMessage(name: string, message: string, data: WebhookMessageEditOptions): Promise<void>;
}
