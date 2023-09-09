import { WebhookMessageCreateOptions, WebhookMessageEditOptions } from "discord.js";
export declare class DiscordAPI {
    static getWebhook(name: string): Promise<{
        id: string;
        token: string;
        name: string;
        avatar: string;
        channelId: string;
    } | null>;
    static sendWebhookMessage(name: string, data: WebhookMessageCreateOptions): Promise<void>;
    static editWebhookMessage(name: string, message: string, data: WebhookMessageEditOptions): Promise<void>;
}
