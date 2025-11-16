import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap(
      "gemini-generate-text", 
      generateText, 
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant that can generate text.",
        prompt: "What is 2 + 2 ??. Return the answer in a JSON object with the key 'answer' and the value being the answer.",
      }
    )

    return { steps }
  },
);