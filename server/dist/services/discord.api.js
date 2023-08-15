var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } from "discord.js";
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from "../middleware/errors/index.js";
const prisma = new PrismaClient();
export class DiscordAPI {
    static getWebhook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.webhook.findUnique({
                where: {
                    name: name
                }
            });
        });
    }
    static sendWebhookMessage(name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = yield DiscordAPI.getWebhook(name);
            if (!webhook)
                throw new NotFoundError("No Webhook Available");
            const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
            const webhookClient = new WebhookClient({ url: webhookUrl });
            const claimButton = new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Primary);
            const redirectButton = new ButtonBuilder().setCustomId("redirect").setLabel("Redirect").setStyle(ButtonStyle.Secondary);
            const archiveButton = new ButtonBuilder().setCustomId("archive").setLabel("Archive").setStyle(ButtonStyle.Success);
            data.components = [new ActionRowBuilder().addComponents(claimButton, redirectButton, archiveButton)];
            yield webhookClient.send(data);
        });
    }
    static editWebhookMessage(name, message, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = yield DiscordAPI.getWebhook(name);
            if (!webhook)
                throw new NotFoundError("No Webhook Available");
            const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
            const webhookClient = new WebhookClient({ url: webhookUrl });
            yield webhookClient.editMessage(message, data);
        });
    }
}
//# sourceMappingURL=discord.api.js.map