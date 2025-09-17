'use client';

import { useEffect, memo, type JSXElementConstructor, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteQuery , type InfiniteQueryObserverOptions} from '@tanstack/react-query';


export interface VirtualScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  parentRef: React.RefObject<HTMLDivElement | null>;
  // useFetcher: () => UseInfiniteQueryResult<R>;
  queryOptions: InfiniteQueryObserverOptions<any>;
  convertorFn: (data: any) => any[];
  estimateSize: (index: number) => number;
  ItemComponent: JSXElementConstructor<{item: any, index: number}>;
  LoaderComponent?: JSXElementConstructor<{}>;
  EmptyComponent?: JSXElementConstructor<{}>;
  ErrorComponent?: JSXElementConstructor<{error: Error}>;
  overscan?: number;
}

export function VirtualScroll({
  queryOptions,
  convertorFn,
  parentRef,
  estimateSize,
  ItemComponent,
  LoaderComponent,
  ErrorComponent,
  EmptyComponent,
  overscan,
  // ...props
}: VirtualScrollProps) {
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<any>(queryOptions);
  
  const MemoizedItem = useMemo(() => memo(({item, index}: {item: any, index: number}) => (
    <ItemComponent item={item} index={index} />
  )), [ItemComponent]);

  const items = data?.pages.flatMap((page) => convertorFn(page)) ?? [];
  const count = hasNextPage ? items.length + 1 : items.length;

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
    count
  });

  useEffect(() => {
    const [lastItem] = rowVirtualizer.getVirtualItems().slice(-1);

    if (
      (lastItem == null || lastItem.index >= items.length - 1) &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    items.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  // Reset virtualizer when query key changes to prevent stale data display
  useEffect(() => {
    if (parentRef.current) {
      rowVirtualizer.scrollToIndex(0, { align: 'start' });
    }
  }, [queryOptions.queryKey, rowVirtualizer]);

  if (status === 'error') {
    return ErrorComponent && <ErrorComponent error={error as Error} />;
  }

  if (status === 'pending') {
    return LoaderComponent && <LoaderComponent />;
  }

  if (items.length === 0) {
    return EmptyComponent && <EmptyComponent />;
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index >= items.length;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
            >
            {isLoaderRow ? (
              (hasNextPage && LoaderComponent) ? (
              <LoaderComponent />
              ) : null
              ) : (
              <MemoizedItem item={items[virtualItem.index]} index={virtualItem.index} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
