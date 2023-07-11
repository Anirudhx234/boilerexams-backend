import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    WebhookClient,
    WebhookMessageCreateOptions,
    WebhookMessageEditOptions
} from "discord.js";
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

export class DiscordAPI {
    private static async getWebhook(name: string) {
        return prisma.webhook.findUnique({
            where: {
                name: name
            }
        });
    }

    public static async sendWebhookMessage(name: string, data: WebhookMessageCreateOptions) {
        const webhook = await DiscordAPI.getWebhook(name);
        if (!webhook) throw new Error("No Webhook Available");
        const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const claimButton = new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Primary);
        const redirectButton = new ButtonBuilder().setCustomId("redirect").setLabel("Redirect").setStyle(ButtonStyle.Secondary);
        const archiveButton = new ButtonBuilder().setCustomId("archive").setLabel("Archive").setStyle(ButtonStyle.Success);
        data.components = [ new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton, redirectButton, archiveButton) ]
        await webhookClient.send(data);
    }

    public static async editWebhookMessage(name: string, message: string, data: WebhookMessageEditOptions) {
        const webhook = await DiscordAPI.getWebhook(name);
        if (!webhook) throw new Error("No Webhook Available");
        const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
        const webhookClient = new WebhookClient({ url: webhookUrl });
        await webhookClient.editMessage(message, data);
    }
}