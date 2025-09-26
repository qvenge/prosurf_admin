import { useEffect } from 'react';

interface UseInfiniteScrollProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export function useInfiniteScroll({
  containerRef,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100
}: UseInfiniteScrollProps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isNearBottom && hasMore && !isLoading) {
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore, containerRef, threshold]);
}