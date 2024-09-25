import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface PaginationComponentProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

export function PagePagination({ currentPage, totalPages, setCurrentPage }: PaginationComponentProps) {
    return (
        <Pagination className="pb-4 text-primary/70">
            <PaginationContent>
                <PaginationItem className="hover:text-primary">
                    <PaginationPrevious
                        href="#"
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index} className="hover:text-primary">
                        <PaginationLink
                            href="#"
                            onClick={() => setCurrentPage(index + 1)}
                            className={currentPage === index + 1 ? "font-bold" : ""}
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
                        href="#"
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
