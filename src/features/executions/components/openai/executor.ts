import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { openaiChannel } from "@/inngest/channels/openai";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type OpenAIData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAIData> = async ({  
    data,
    nodeId, 
    context, 
    step,
    publish,
}) => {
    await publish(
        openaiChannel().status({
            nodeId,
            status: "loading",
        })
    )

    if (!data.variableName) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("OpenAI node: Variable name not configured :/");
    }

    if (!data.credentialId) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("OpenAI node: Credential not configured :/");
    }

    if (!data.userPrompt) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("OpenAI node: User prompt not configured :/");
    }

    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant.";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
            }
        })
    })

    if (!credential) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("OpenAI node: Credential not found :/");
    }

    const openai = createOpenAI({
        apiKey: credential.value,
    });

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai(data.model || "gpt-4"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            }
        )

        const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : null;

        await publish(
            openaiChannel().status({
                nodeId,
                status: "success",
            })
        )

        return {
            ...context,
            [data.variableName]: {
                aiResponse: text,
            },
        }
    } catch (error) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw error;
    }
}