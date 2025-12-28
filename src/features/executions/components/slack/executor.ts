import type { NodeExecutor } from "@/features/executions/types";
import { decode } from "html-entities"; 
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type SlackData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({  
    data,
    nodeId, 
    userId,
    context, 
    step,
    publish,
}) => {
    await publish(
        slackChannel().status({
            nodeId,
            status: "loading",
        })
    )

    if (!data.content) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("Slack node: Content not configured :/");
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);

    try {
        const result = await step.run("slack-webhook", async () => {
            if (!data.webhookUrl) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error",
                    })
                )
        
                throw new NonRetriableError("Slack node: Webhook URL not configured :/");
            }

            await fetch(data.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: content,
                }),
            })

            if (!data.variableName) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error",
                    })
                )
        
                throw new NonRetriableError("Slack node: Variable name not configured :/");
            }

            return {
                ...context,
                [data.variableName]: {
                    messageContent: content,
                    messageSent: true,
                }
            }
        })

        await publish(
            slackChannel().status({
                nodeId,
                status: "success",
            })
        )

        return result;
    } catch (error) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw error;
    }
}