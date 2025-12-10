interface PageProps {
    params: Promise<{
        workflowId: string;
    }>
}

const Page =  async ({ params } : PageProps) => {
    const { workflowId } = await params;

    return (
        <h1>Workflow Id: {workflowId}</h1>
    )
}

export default Page;