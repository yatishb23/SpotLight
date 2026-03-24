import { useState, useCallback, useEffect } from 'react';

interface UseSearchFilterProps {
  onFilter?: (filters: SearchFilters) => void;
  debounceMs?: number;
}

export interface SearchFilters {
  searchTerm: string;
  category: string;
}

export function useSearchFilter({ onFilter, debounceMs = 300 }: UseSearchFilterProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      onFilter?.({ searchTerm, category });
    }, debounceMs);

    setDebounceTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm, category, debounceMs, onFilter]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const updateCategory = useCallback((cat: string) => {
    setCategory(cat);
  }, []);

  const reset = useCallback(() => {
    setSearchTerm('');
    setCategory('');
  }, []);

  return {
    searchTerm,
    category,
    updateSearchTerm,
    updateCategory,
    reset,
    filters: { searchTerm, category },
  };
}
