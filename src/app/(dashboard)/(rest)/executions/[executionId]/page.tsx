interface PageProps {
    params: Promise<{
        executionId: string;
    }>
}

const Page =  async ({ params } : PageProps) => {
    const { executionId } = await params;

    return (
        <h1>Execution Id: {executionId}</h1>
    )
}

export default Page;