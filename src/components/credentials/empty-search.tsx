export function EmptySearch({ onResetFilters }: { onResetFilters: () => void }) {
    return (
        <div className='flex flex-col grow justify-center items-center gap-4 p-8 w-full h-full'>
            <p className='text-lg'>No credentials matching the current filters</p>
            <span
                className='underline cursor-pointer'
                onClick={onResetFilters}
            >
                Reset Filters
            </span>
        </div>
    );
}
