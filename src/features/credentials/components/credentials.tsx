'use client';

import { formatDistanceToNow } from "date-fns";
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCreateCredential, useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { CredentialModel as Credential } from "@/generated/prisma/models";
import { KeyIcon } from "lucide-react";

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams
    })
    
    return (
        <EntitySearch 
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Credentials"
        />
    )
}

export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();

    return (
        <EntityList 
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialsEmpty />}
        />
    )
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <EntityHeader 
            title="Credentials"
            description="Create and manage your credentials"
            newButtonLabel="New Credential"
            newButtonHref="/credentials/new"
            disabled={disabled}
        />
    )
}

export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();

    return (
        <EntityPagination 
            disabled={credentials.isFetching}
            totalPages={credentials.data.totalPages}
            page={credentials.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<CredentialsHeader />} 
            search={<CredentialsSearch />} 
            pagination={<CredentialsPagination />}
        >
            {children}
        </EntityContainer>
    )
}

export const CredentialsLoading = () => {
    return <LoadingView message="Loading credentials..." />
}

export const CredentialsError = () => {
    return <ErrorView message="An error occurred while loading credentials :(" />
}

export const CredentialsEmpty = () => {
    const router = useRouter();

    const handleCreate = () => {
        router.push("/credentials/new");
    }

    return (
        <EmptyView 
            message="You haven't created any credentials yet. Get started by creating your first credential ;)"
            onNew={handleCreate}
        />
    )
}

export const CredentialItem = ({data}: {data: Credential}) => {
    const removeCredential = useRemoveCredential();

    const handleRemove = () => {
        removeCredential.mutate({ id: data.id })
    }

    return (
        <EntityItem 
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    &bull; Created{" "}
                    {formatDistanceToNow(data.createdAt, { addSuffix: true })}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <KeyIcon className="size-5 text-muted-foreground" />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    )
}