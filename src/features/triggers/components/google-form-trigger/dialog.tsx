"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
    const params = useParams();
    const workflowId = params.workflowId as string;

    // constructing the webhook URL
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookURL = `${baseURL}/api/webhooks/google-form?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookURL);
            toast.success("Webhook URL copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    }

    const copyScriptToClipboard = async () => {
        try {
            const script = generateGoogleFormScript(webhookURL);
            await navigator.clipboard.writeText(script);
            toast.success("Script copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy script to clipboard");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google Form Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in your Google Form's App Script to trigger this workflow when a form is submitted.
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
                            <li>Open your Google Form</li>
                            <li>Click the three dots menu → Script Editor</li>
                            <li>Copy and paste the script below</li>
                            <li>Replace the <code className="font-mono text-xs text-primary bg-muted p-1">WEBHOOK_URL</code> with the webhook URL above</li>
                            <li>Save and click "Triggers" → Add Trigger</li>
                            <li>Choose: From form → On form submit → Save</li>
                        </ol>
                    </div>

                    <Separator />

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Google Apps Script:</h4>
                        <Button size="sm" type="button" variant="outline" onClick={copyScriptToClipboard}>
                            <CopyIcon className="size-4" />
                            Copy Script
                        </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This script includes your webhook URL and handles form submissions.
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{googleForm.respondentEmail}}"}
                                </code>
                                - Respondent's email
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{googleForm.responses['Question Name']}}"}
                                </code>
                                - Specific question response
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                                    {"{{json googleForm.responses}}"}
                                </code>
                                - All responses as JSON object
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}