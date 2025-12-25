import { Connection, Node } from "@/generated/prisma/client";
import toposort from "toposort";
import { inngest } from "./client";

export const topologicalSort = (nodes: Node[], connections: Connection[]): Node[] => {
    // If there are no connections, return the nodes in the order they were provided (they are all independent)
    if (connections.length === 0) {
        return nodes;
    }

    // create edges array for toposort
    const edges: [string, string][] = connections.map((connection) => [connection.fromNodeId, connection.toNodeId]);

    // add nodes with no connections as self-edges to ensure they are included in the sort
    const connectedNodesId = new Set<string>();
    for (const connection of connections) {
        connectedNodesId.add(connection.fromNodeId);
        connectedNodesId.add(connection.toNodeId);
    }

    for (const node of nodes) {
        if (!connectedNodesId.has(node.id)) {
            edges.push([node.id, node.id]); 
        }
    }

    // sort nodes topologically
    let sortedNodeIds: string[];

    try {
        sortedNodeIds = toposort(edges);

        // remove duplicates (from self-edges)
        sortedNodeIds = [...new Set(sortedNodeIds)];
    } catch (error) {
        if (error instanceof Error && error.message.includes("Cyclic")) {
            throw new Error("Cyclic dependency detected in workflow");
        }
        throw error;
    }

    // map sorted node ids back to original nodes
    const nodesMap = new Map(nodes.map((n) => [n.id, n]));
    return sortedNodeIds.map((id) => nodesMap.get(id)!).filter(Boolean)
}

export const sendInngestWorkflowExecution = async (data: {
    workflowId: string;
    [key: string]: any;
}) => {
    return inngest.send({
        name: "workflows/execute.workflow",
        data
    })
}