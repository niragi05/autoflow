import { sendInngestWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");

        if (!workflowId) {
            return NextResponse.json(
                { success: false, error: "Workflow ID is required" },
                { status: 400 }
            )
        }

        const body = await request.json();

        const stripeData = {
            eventId: body.id,
            eventType: body.type,
            timestamp: body.created,
            livemode: body.livemode,
            raw: body.data?.object,
        }

        await sendInngestWorkflowExecution({
            workflowId,
            initialData: {
                stripe: stripeData,
            }
        })

        return NextResponse.json(
            { success: true, message: "Stripe event processed successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Stripe Webhook error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process Stripe event" },
            { status: 500 }
        )
    }
}