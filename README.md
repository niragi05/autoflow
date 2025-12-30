# Autoflow

A visual workflow automation platform that lets you build powerful automations using a drag-and-drop interface. Connect services, trigger actions, and automate your workflows without writing code.
![Sign Up Screenshot](./public/SignUpScreenshot.png)

## What is Autoflow?

Autoflow is essentially a self-hosted alternative to platforms like Zapier or Make.com. You can create workflows visually by connecting nodes together, where each node performs a specific action or waits for a trigger. The platform handles the execution, error handling, and provides real-time status updates as your workflows run.

The core idea is simple: drag nodes onto a canvas, connect them together, configure each node's settings, and let the system execute them in the correct order. Whether you're sending AI-generated messages to Discord when a Stripe payment comes through, or processing Google Form submissions with custom logic, Autoflow handles it.

## Tech Stack

### Frontend
- **Next.js 15** - App Router with React Server Components
- **React 19** - Latest React with concurrent features
- **React Flow** (`@xyflow/react`) - Visual workflow editor
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Server state management
- **Jotai** - Client state management

### Backend & Infrastructure
- **Inngest** - Workflow execution engine with real-time capabilities
- **Better Auth** - Authentication with email/password and OAuth (GitHub, Google)
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe ORM
- **tRPC** - Type-safe API layer

### Additional Tools
- **Sentry** - Error tracking and monitoring
- **Cryptr** - Credential encryption
- **Handlebars** - Template engine for dynamic values in workflows
- **Biome** - Fast linter and formatter

## Architecture Overview

### Key Components

**Visual Editor** (`src/features/editor/`)
- Built on React Flow for the drag-and-drop interface
- Custom node components for each node type
- Real-time save functionality
- Node validation (e.g., only one manual trigger per workflow)

**Workflow Execution** (`src/inngest/functions.ts`)
- Single Inngest function handles all workflow executions
- Uses topological sorting to determine execution order
- Context passing between nodes allows data flow
- Each node execution is wrapped in Inngest steps for observability

**Node System** (`src/features/executions/`)
- Executor registry pattern for extensibility
- Each node type has its own executor function
- Standardized interface: `NodeExecutor<TData>`
- Real-time status updates via Inngest channels

**Credential Management** (`src/features/credentials/`)
- User-scoped credentials stored encrypted in database
- Supports OpenAI, Anthropic, and Gemini API keys
- Credentials are decrypted only during node execution
- Never exposed to the frontend

## Core Features

### Trigger Nodes

**Manual Trigger** - Execute workflows on-demand from the UI. Useful for testing or one-off runs.

**Google Forms Trigger** - Automatically runs workflows when form submissions are received via webhook. The form data is passed as initial context to the workflow.

**Stripe Trigger** - Listens for Stripe webhook events and triggers workflows. Useful for payment processing automations, subscription management, etc.

### Action Nodes

**AI Nodes** (OpenAI, Anthropic, Gemini)
- Configure prompts with Handlebars templating
- Access previous node outputs via context variables
- Store API keys securely as encrypted credentials
- Real-time status updates during execution

**HTTP Request Node**
- Make GET, POST, PUT, PATCH, DELETE requests
- Dynamic URLs and bodies using Handlebars
- Response data stored in context for downstream nodes
- Supports JSON and text responses

**Discord & Slack Nodes**
- Send messages to channels
- Rich message formatting
- Webhook-based integration

### Real-time Execution Monitoring

When a workflow runs, you can watch it execute in real-time. Each node publishes status updates (`loading`, `success`, `error`) through Inngest Realtime channels. The UI subscribes to these channels and updates node status indicators as execution progresses.

This is particularly useful for:
- Debugging workflows
- Understanding execution flow
- Identifying bottlenecks
- Monitoring long-running workflows

## Implementation Details

### Topological Sorting

Workflows are represented as directed graphs where nodes are connected via edges. To execute nodes in the correct order (respecting dependencies), we use topological sorting. The code ensures that if Node B depends on Node A (A → B), Node A executes first. The algorithm also detects cycles and throws an error if the workflow graph is invalid.

### Context Passing

Each node receives a `context` object containing outputs from all previously executed nodes. Nodes can read from this context and add their own outputs:

```typescript
// Example: HTTP Request node adds response to context
return {
    ...context,
    [data.variableName]: {
        httpResponse: {
            status: response.status,
            data: responseData,
        }
    }
}
```

Downstream nodes can access this data using Handlebars templates:
```
{{httpResponse.data.user.email}}
```

### Executor Registry Pattern

Instead of a giant switch statement, we use a registry pattern for node executors:

```typescript
// src/features/executions/lib/executor-registry.ts
export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: httpRequestExecutor,
    [NodeType.OPENAI]: openaiExecutor,
    // ... etc
}

export const getExecutor = (type: NodeType): NodeExecutor =>
    executorRegistry[type];
```

This makes adding new node types straightforward: implement the executor function and register it. The execution engine doesn't need to know about specific node types.

### Credential Encryption

API keys and sensitive credentials are encrypted before storage. Credentials are:
- Encrypted on creation/update
- Stored encrypted in the database
- Decrypted only during node execution (server-side only)
- Never sent to the frontend
- User-scoped (users can only access their own credentials)

### Real-time Status Updates

Each node type has its own Inngest Realtime channel:

```typescript
// Example: HTTP Request channel
export const httpRequestChannel = channel("http-request-execution")
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>()
    );
```

During execution, nodes publish status updates:
```typescript
await publish(
    httpRequestChannel().status({
        nodeId,
        status: "loading",
    })
);
```

The frontend subscribes to these channels and updates the UI accordingly. This gives you live feedback as workflows execute.

### Error Handling

Workflow executions are wrapped in Inngest's error handling:

```typescript
export const executeWorkflow = inngest.createFunction(
    { 
        id: "execute-workflow",
        retries: 0, // Don't retry failed workflows
        onFailure: async ({event, step}) => {
            // Update execution record with error details
            return prisma.execution.update({
                where: { inngestEventId: event.data.event.id },
                data: {
                    status: ExecutionStatus.FAILED,
                    error: event.data.error.message,
                    errorStack: event.data.error.stack,
                    completedAt: new Date(),
                }
            })
        }
    },
    // ... rest of function
);
```

Failed executions are recorded with error messages and stack traces, making debugging easier.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── (editor)/     # Workflow editor
│   │   └── (rest)/       # Other dashboard pages
│   └── api/              # API routes
│       ├── auth/         # Better Auth endpoints
│       ├── inngest/      # Inngest webhook handler
│       ├── trpc/         # tRPC endpoint
│       └── webhooks/     # External webhooks (Stripe, Google Forms)
│
├── components/            # Shared React components
│   ├── ui/               # Radix UI components
│   └── react-flow/       # React Flow custom components
│
├── features/              # Feature-based modules
│   ├── auth/             # Authentication components
│   ├── credentials/      # Credential management
│   ├── editor/           # Workflow editor
│   ├── executions/       # Node executors and execution UI
│   ├── triggers/         # Trigger node components
│   └── workflows/        # Workflow CRUD operations
│
├── inngest/              # Inngest functions and channels
│   ├── channels/         # Realtime channel definitions
│   ├── client.ts         # Inngest client setup
│   ├── functions.ts      # Workflow execution function
│   └── utils.ts          # Topological sort, helpers
│
├── lib/                  # Shared utilities
│   ├── auth.ts          # Better Auth configuration
│   ├── db.ts            # Prisma client
│   ├── encryption.ts    # Credential encryption
│   └── utils.ts         # General utilities
│
└── trpc/                 # tRPC setup
    ├── routers/         # API route definitions
    └── server.tsx        # Server-side tRPC setup
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Inngest account (for workflow execution)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd autoflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/autoflow"

# Encryption (generate a random string)
ENCRYPTION_KEY="your-encryption-key-here"

# Better Auth
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Sentry (optional)
SENTRY_DSN=""
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development servers:

Terminal 1 - Inngest Dev Server:
```bash
npm run inngest:dev
```

Terminal 2 - Next.js Dev Server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Development Workflow

1. **Create a workflow** - Navigate to `/workflows` and create a new workflow
2. **Add nodes** - Click "Add Node" and select a node type
3. **Configure nodes** - Double-click nodes to configure them
4. **Connect nodes** - Drag from output handles to input handles
5. **Save** - Click "Save Workflow" to persist changes
6. **Execute** - If you have a manual trigger, click "Execute Workflow" to test

### Running Tests

Currently, the project doesn't have a test suite set up. This is something I am planning to add.

## Database Schema

The core models:

- **User** - Authentication and user data
- **Workflow** - Workflow definitions
- **Node** - Individual workflow nodes with position and configuration
- **Connection** - Edges between nodes (defines execution order)
- **Execution** - Workflow execution records with status and output
- **Credential** - Encrypted API keys and secrets

See `prisma/schema.prisma` for the full schema.

## Adding New Node Types

To add a new node type:

1. **Add to Prisma schema** - Add the node type to the `NodeType` enum
2. **Create executor** - Implement `NodeExecutor` in `src/features/executions/components/[node-name]/executor.ts`
3. **Create UI component** - Build the React Flow node component
4. **Register executor** - Add to `executor-registry.ts`
5. **Register component** - Add to `node-components.ts`
6. **Create channel** (optional) - If you want real-time status updates, create an Inngest channel

Example executor structure:
```typescript
export const myNodeExecutor: NodeExecutor<MyNodeData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    // Publish loading status
    await publish(channel().status({ nodeId, status: "loading" }));
    
    // Execute node logic
    const result = await step.run("my-node-action", async () => {
        // Your logic here
        return { ...context, myOutput: "value" };
    });
    
    // Publish success status
    await publish(channel().status({ nodeId, status: "success" }));
    
    return result;
};
```

## Deployment

### Environment Setup

1. Set up a PostgreSQL database (e.g., Supabase, Neon, Railway)
2. Configure environment variables in your hosting platform
3. Run migrations: `npx prisma migrate deploy`
4. Generate Prisma client: `npx prisma generate`

### Inngest Setup

1. Create an Inngest account and app
2. Get your event key and signing key
3. Configure the Inngest endpoint in your Inngest dashboard:
   ```
   https://yourdomain.com/api/inngest
   ```
4. For local development with ngrok:
   ```bash
   npm run ngrok:dev  # Sets up ngrok tunnel
   ```

### Build & Deploy

```bash
npm run build
npm start
```

The app is ready to deploy to Vercel, Railway, or any Node.js hosting platform.

## Troubleshooting

### Workflows not executing

- Check Inngest Dev Server is running
- Verify `INNGEST_EVENT_KEY` is set correctly
- Check browser console for errors
- Verify workflow has a trigger node

### Real-time status not updating

- Ensure Inngest Realtime is configured
- Check network tab for WebSocket connections
- Verify channel names match between executor and UI

### Credentials not working

- Verify `ENCRYPTION_KEY` is set (required for encryption/decryption)
- Check credential is assigned to the correct node
- Ensure API key is valid (test in node configuration dialog)

### Database connection issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from your hosting platform
- Run `npx prisma migrate dev` to ensure schema is up to date

## Contributing

This is a personal project, but if you're interested in contributing:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Copyright (c) 2025 Niragi Masalia

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Workflow execution powered by [Inngest](https://www.inngest.com)
- Visual editor uses [React Flow](https://reactflow.dev)
- UI components from [Radix UI](https://www.radix-ui.com)
