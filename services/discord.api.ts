import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    WebhookClient,
    WebhookMessageCreateOptions,
    WebhookMessageEditOptions
} from "discord.js";
import prisma from "../libs/prisma.js";
import { NotFoundError } from "../middleware/errors/index.js";

export class DiscordAPI {
    static async getWebhook(name: string) {
        return prisma.webhook.findUnique({
            where: {
                name: name
            }
        });
    }

    public static async sendWebhookMessage(name: string, data: WebhookMessageCreateOptions) {
        const webhook = await DiscordAPI.getWebhook(name);
        if (!webhook) throw new NotFoundError("No Webhook Available");
        const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const claimButton = new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Primary);
        const redirectButton = new ButtonBuilder().setCustomId("redirect").setLabel("Redirect").setStyle(ButtonStyle.Secondary);
        const archiveButton = new ButtonBuilder().setCustomId("archive").setLabel("Archive").setStyle(ButtonStyle.Success);
        data.components = [new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton, redirectButton, archiveButton)]
        await webhookClient.send(data);
    }

    public static async editWebhookMessage(name: string, message: string, data: WebhookMessageEditOptions) {
        const webhook = await DiscordAPI.getWebhook(name);
        if (!webhook) throw new NotFoundError("No Webhook Available");
        const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
        const webhookClient = new WebhookClient({ url: webhookUrl });
        await webhookClient.editMessage(message, data);
    }
}