import { auth } from '@/lib/auth';
import { LoadingScreen } from '@/components/global/loading-screen';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { CredentialsList } from '@/components/credentials/credentials-list';
import { CredentialsSortControls } from '@/components/credentials/credentials-sort-controls';
import { PageHeader } from '@/components/global/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { InboxIcon, Share2Icon } from 'lucide-react';
import { CredentialsDialog } from '@/components/credentials/credentials-dialog';
import { PagePagination } from '@/components/global/page-pagination';
import { EmptySearch } from '@/components/credentials/empty-search';
import { isCredentialsActive } from '@/lib/utils';
import { Credentials, CredentialsRequest, CredentialsType } from '@/convex/types';
import { CredentialsSortOption } from '@/hooks/use-credentials-management';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface CredentialsPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams?: Promise<{
        tab?: 'shared' | 'requested';
        page?: string;
        search?: string;
        sort?: CredentialsSortOption;
        types?: CredentialsType | CredentialsType[];
        hideExpired?: 'true' | 'false';
        dialog?: 'new' | 'request';
    }>;
}

const CREDENTIALS_PER_PAGE = 14;

export default async function CredentialsPage({ params, searchParams }: CredentialsPageProps) {

    const { slug } = await params;
    const searchParamsResult = await searchParams;

    const session = await auth();
    const workspace = await fetchQuery(api.workspaces.getWorkspaceBySlug, { slug });

    if (!session?.user) return <LoadingScreen />;
    if (!workspace) return redirect('/dashboard');

    const [credentials, credentialsRequests] = await Promise.all([
        fetchQuery(api.credentials.getWorkspaceCredentials, { workspaceId: workspace._id }),
        fetchQuery(api.credentialsRequests.getWorkspaceCredentialsRequests, { workspaceId: workspace._id })
    ]);

    const activeTab = searchParamsResult?.tab || 'shared';
    const currentPage = Math.max(1, Math.min(Number(searchParamsResult?.page || 1), Math.ceil((activeTab === 'shared' ? credentials.length : credentialsRequests.length) / CREDENTIALS_PER_PAGE)));
    const searchTerm = searchParamsResult?.search?.toLowerCase() || '';
    const sortOption = searchParamsResult?.sort || 'name';
    const selectedTypes = Array.isArray(searchParamsResult?.types)
        ? searchParamsResult.types
        : searchParamsResult?.types?.split(',') as CredentialsType[] || [];
    const hideExpired = searchParamsResult?.hideExpired === 'true';

    const filterItems = <T extends Credentials | CredentialsRequest>(items: T[], isCredentials: boolean): T[] => {
        return items
            .filter(item => {
                const nameMatch = item.name.toLowerCase().includes(searchTerm);
                const typeMatch = selectedTypes.length === 0 || selectedTypes.some(type =>
                    isCredentials ? (item as Credentials).type === type : (item as CredentialsRequest).credentials[0]?.type === type
                );
                const expiryMatch = isCredentials ? (!hideExpired || isCredentialsActive(item as Credentials)) : true;
                return nameMatch && typeMatch && expiryMatch;
            })
            .sort((a, b) => {
                if (sortOption === 'createdAtAsc') return Number(a._creationTime) - Number(b._creationTime);
                if (sortOption === 'createdAtDesc') return Number(b._creationTime) - Number(a._creationTime);
                if (sortOption === 'updatedAt') return Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0);
                return a.name.localeCompare(b.name);
            });
    };

    const filteredItems = activeTab === 'shared'
        ? filterItems(credentials, true)
        : filterItems(credentialsRequests, false);

    const totalPages = Math.ceil(filteredItems.length / CREDENTIALS_PER_PAGE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * CREDENTIALS_PER_PAGE, currentPage * CREDENTIALS_PER_PAGE);

    const buildQueryString = (params: Record<string, string | number | string[] | undefined>) => {
        const newParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === '') return;
            const stringValue = Array.isArray(value) ? value.join(',') : String(value);
            newParams.set(key, stringValue);
        });
        return newParams.toString();
    };

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Credentials">
                <Link href={`?${buildQueryString({ ...searchParamsResult, dialog: 'new' })}`}>
                    <Button className="gap-2" variant="outline">
                        <Share2Icon className="w-4 h-4" />
                        Share credentials
                    </Button>
                </Link>
                <Link href={`?${buildQueryString({ ...searchParamsResult, dialog: 'request' })}`}>
                    <Button className="gap-2">
                        <InboxIcon className="w-4 h-4" />
                        Request credentials
                    </Button>
                </Link>
            </PageHeader>

            <div className={`${totalPages > 1 ? 'pb-10' : ''} overflow-auto grow flex flex-col`}>
                <Tabs value={activeTab} className="px-8 py-4 h-full">
                    <TabsList>
                        <Link href={`?${buildQueryString({ ...searchParamsResult, tab: 'shared' })}`}>
                            <TabsTrigger value="shared">Shared</TabsTrigger>
                        </Link>
                        <Link href={`?${buildQueryString({ ...searchParamsResult, tab: 'requested' })}`}>
                            <TabsTrigger value="requested">Requested</TabsTrigger>
                        </Link>
                    </TabsList>

                    <TabsContent value="shared">
                        <div className="flex flex-col gap-4 pt-4 grow">
                            <CredentialsSortControls
                                searchTerm={searchTerm}
                                sortOption={sortOption}
                                selectedTypes={selectedTypes}
                                hideExpired={hideExpired}
                                showHideExpired={true}
                                baseUrl={`/dashboard/${slug}/credentials`}
                            />
                            {paginatedItems.length === 0 ? (
                                searchTerm || selectedTypes.length > 0 || hideExpired ? (
                                    <EmptySearch onResetFilters={() => redirect(`?${buildQueryString({ tab: activeTab })}`)} />
                                ) : (
                                    <div className="flex justify-center items-center py-8 grow">
                                        <p className="text-muted-foreground text-center">
                                            Share your first credentials to see them here
                                        </p>
                                    </div>
                                )
                            ) : (
                                <CredentialsList
                                    items={paginatedItems}
                                    type="shared"
                                    currentPage={currentPage}
                                    itemsPerPage={CREDENTIALS_PER_PAGE}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="requested">
                        <div className="flex flex-col gap-4 pt-4 grow">
                            <CredentialsSortControls
                                searchTerm={searchTerm}
                                sortOption={sortOption}
                                selectedTypes={selectedTypes}
                                hideExpired={hideExpired}
                                showHideExpired={true}
                                baseUrl={`/dashboard/${slug}/credentials`}
                            />
                            {paginatedItems.length === 0 ? (
                                searchTerm || selectedTypes.length > 0 ? (
                                    <EmptySearch onResetFilters={() => redirect(`?${buildQueryString({ tab: activeTab })}`)} />
                                ) : (
                                    <div className="flex justify-center items-center py-8 grow">
                                        <p className="text-muted-foreground text-center">
                                            Request your first credentials to see them here
                                        </p>
                                    </div>
                                )
                            ) : (
                                <CredentialsList
                                    items={paginatedItems}
                                    type="requested"
                                    currentPage={currentPage}
                                    itemsPerPage={CREDENTIALS_PER_PAGE}
                                />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            {/* 
            {totalPages > 1 && (
                <div className="right-0 bottom-0 left-0 absolute bg-linear-to-t from-background to-transparent mx-auto pt-10">
                    <PagePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hrefBuilder={(page) => `?${buildQueryString({ ...searchParamsResult, page })}`}
                    />
                </div>
            )} */}

            {/* <CredentialsDialog
                isOpen={!!searchParamsResult?.dialog}
                formType={searchParamsResult?.dialog === 'request' ? 'request' : 'new'}
                onOpenChange={(open) => !open && redirect(`?${buildQueryString({ ...searchParamsResult, dialog: undefined })}`)}
            /> */}
        </div>
    );
}