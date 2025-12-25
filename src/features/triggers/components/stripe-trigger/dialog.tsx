"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
    const params = useParams();
    const workflowId = params.workflowId as string;

    // constructing the webhook URL
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookURL = `${baseURL}/api/webhooks/stripe?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookURL);
            toast.success("Webhook URL copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Stripe Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Configure this webhook URL in your Stripe dashboard to trigger this workflow when a payment is received.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhookURL">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input id="webhookURL" value={webhookURL} readOnly className="font-mono text-sm" />
                            <Button type="button" size="icon" variant="outline" onClick={copyToClipboard}>
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Setup Instructions</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Open your Stripe Dashboard</li>
                            <li>Go to Developers → Webhooks</li>
                            <li>Click "Add Endpoint"</li>
                            <li>Paste the webhook URL above</li>
                            <li>Select the events you want to trigger the workflow for (e.g. payment_intent.succeeded, payment_method.attached, etc.)</li>
                            <li>Save and Copy the signing secret</li>
                        </ol>
                    </div>

                    <Separator />

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{stripe.amount}}"}
                                </code>
                                - Payment amount
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{stripe.currency}}"}
                                </code>
                                - Currency Code
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{stripe.customerId}}"}
                                </code>
                                - Customer ID
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{stripe.eventType}}"}
                                </code>
                                - Event Type (e.g. payment_intent.succeeded, payment_method.attached, etc.)
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{json stripe}}"}
                                </code>
                                - All Stripe event data as JSON object
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}