"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { openaiChannel } from "@/inngest/channels/openai";
import { inngest } from "@/inngest/client";

export type OpenAIRefreshToken = Realtime.Token<typeof openaiChannel, ["status"]>

export async function fetchOpenAIRealtimeToken(): Promise<OpenAIRefreshToken> {
    const token = await getSubscriptionToken(
        inngest, {
            channel: openaiChannel(),
            topics: ["status"],
        }
    )

    return token;
}