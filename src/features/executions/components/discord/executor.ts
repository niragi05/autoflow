import type { NodeExecutor } from "@/features/executions/types";
import { decode } from "html-entities"; 
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { discordChannel } from "@/inngest/channels/discord";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type DiscordData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
    username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({  
    data,
    nodeId, 
    userId,
    context, 
    step,
    publish,
}) => {
    await publish(
        discordChannel().status({
            nodeId,
            status: "loading",
        })
    )

    if (!data.content) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("Discord node: Content not configured :/");
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);
    const username = data.username ? decode(Handlebars.compile(data.username)(context)) : undefined;

    try {
        const result = await step.run("discord-webhook", async () => {
            if (!data.webhookUrl) {
                await publish(
                    discordChannel().status({
                        nodeId,
                        status: "error",
                    })
                )
        
                throw new NonRetriableError("Discord node: Webhook URL not configured :/");
            }

            await fetch(data.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: content.slice(0, 2000),
                    username: username,
                }),
            })

            if (!data.variableName) {
                await publish(
                    discordChannel().status({
                        nodeId,
                        status: "error",
                    })
                )
        
                throw new NonRetriableError("Discord node: Variable name not configured :/");
            }

            return {
                ...context,
                [data.variableName]: {
                    messageContent: content.slice(0, 2000),
                    messageUsername: username,
                    messageSent: true,
                }
            }
        })

        await publish(
            discordChannel().status({
                nodeId,
                status: "success",
            })
        )

        return result;
    } catch (error) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw error;
    }
}