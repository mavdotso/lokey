import { CredentialsSortControls } from "@/components/credentials/credentials-sort-controls"
import { EmptySearch } from "@/components/credentials/empty-search"
import { CredentialsList } from "@/components/credentials/credentials-list"
import { TabType } from "@/app/(app)/dashboard/[slug]/credentials/page"

interface TabContentProps {
    type: TabType;
    isFiltered: boolean;
    paginatedItems: any[];
    filters: any;
    resetFilters: () => void;
    handleFilterChange: (type: string, value: any) => void;
    currentPage: number;
    itemsPerPage: number;
}

export function TabContent({ type, isFiltered, paginatedItems, filters, resetFilters, handleFilterChange, currentPage, itemsPerPage }: TabContentProps) {

    return (
        <div className="flex flex-col gap-4 pt-4 grow">
            <CredentialsSortControls
                {...filters}
                onFilterChange={handleFilterChange}
                showHideExpired={type === 'shared'}
            />

            {paginatedItems.length === 0 ? (
                isFiltered ? (
                    <EmptySearch onResetFilters={resetFilters} />
                ) : (
                    <div className="flex-center py-8 grow">
                        <p className="text-muted-foreground text-center">
                            {type === 'shared'
                                ? "Share your first credentials to see them here"
                                : "Request your first credentials to see them here"}
                        </p>
                    </div>
                )
            ) : (
                <CredentialsList
                    items={paginatedItems}
                    type={type}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    )
}