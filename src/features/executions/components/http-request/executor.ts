import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

type HttpRequestData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({  
    data,
    nodeId, 
    context, 
    step 
}) => {
    // TODO: Publish "loading" state for http request

    if (!data.endpoint) {
        // TODO: Publish "error" state for http request
        throw new NonRetriableError("HTTP Request node: No endpoint provided")
    }

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || "GET";

        const options: RequestInit = { method };

        if (method === "POST" || method === "PUT" || method === "PATCH") {
            options.body = data.body;
            options.headers = {
                "Content-Type": "application/json",
            }
        }

        const response = await fetch(endpoint, options);
        const contentType = response.headers.get("content-type");
        const responseData = contentType?.includes("application/json") ? await response.json() : await response.text();

        return {
            ...context,
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            }
        }
    })

    // TODO: Publish "success" state for http request

    return result;
}