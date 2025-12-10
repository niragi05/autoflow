interface PageProps {
    params: Promise<{
        credentialId: string;
    }>
}

const Page =  async ({ params } : PageProps) => {
    const { credentialId } = await params;

    return (
        <h1>Credential Id: {credentialId}</h1>
    )
}

export default Page;