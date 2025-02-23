import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    hrefBuilder: (page: number) => string;
}

export function PagePagination({ currentPage, totalPages, hrefBuilder }: PaginationComponentProps) {
    return (
        <Pagination className="pb-4 text-primary/70">
            <PaginationContent>
                <PaginationItem className="hover:text-primary">
                    <PaginationPrevious
                        href={hrefBuilder(Math.max(currentPage - 1, 1))}
                    />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index} className="hover:text-primary">
                        <PaginationLink
                            href={hrefBuilder(index + 1)}
                            isActive={currentPage === index + 1}
                        >
                            {index + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {totalPages > 5 && (
                    <PaginationItem className="hover:text-primary">
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                <PaginationItem className="hover:text-primary">
                    <PaginationNext
                        href={hrefBuilder(Math.min(currentPage + 1, totalPages))}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}