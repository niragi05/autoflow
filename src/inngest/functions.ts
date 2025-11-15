import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // fetching a video
    await step.sleep("fetching", "5s");

    // transcribing the video
    await step.sleep("transcribing", "5s");

    // summarizing the transcript
    await step.sleep("summarizing", "5s");

    await step.run("create-workflow", () => {
        return prisma.workflow.create({
            data: {
                name: "workflow-from-inngest"
            }
        })
    })
  },
);