'use client';

import React, { useId } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface SearchInputProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (query: string) => void;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  isFilterOpen?: boolean;
  filterControlsId?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchInput = ({
  id,
  value,
  defaultValue,
  onChange,
  onSubmit,
  onFilterClick,
  isFilterActive = false,
  isFilterOpen = false,
  filterControlsId,
  placeholder = 'Search classified jobs...',
  label = 'Search classified jobs',
  className = '',
  disabled = false,
}: SearchInputProps) => {
  const generatedId = useId();
  const inputId = id || `search-${generatedId}`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    const formData = new FormData(e.currentTarget);
    const query = (formData.get('search') as string) || '';
    onSubmit?.(query);
  };

  return (
    <form
      role="search"
      aria-label={label}
      onSubmit={handleSubmit}
      className={`flex w-full items-center gap-3 ${className}`.trim()}
    >
      <div className="border-border bg-background focus-within:border-primary focus-within:ring-focus-ring focus-within:ring-offset-background relative flex h-12 w-full items-center rounded-lg border transition-colors focus-within:ring-3 focus-within:ring-offset-2">
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>

        <div className="text-muted-foreground pointer-events-none pl-4" aria-hidden="true">
          <Search className="h-5 w-5" />
        </div>

        <input
          id={inputId}
          name="search"
          type="search"
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          className="text-foreground placeholder:text-muted-foreground h-full w-full bg-transparent px-3 text-base focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {onFilterClick && (
        <Button
          type="button"
          variant={isFilterActive ? 'primary' : 'secondary'}
          size="md"
          disabled={disabled}
          aria-label="Filter search results"
          aria-expanded={isFilterOpen}
          aria-controls={filterControlsId}
          onClick={onFilterClick}
          className="h-12 w-12 shrink-0 p-0"
        >
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
        </Button>
      )}
    </form>
  );
};

export default SearchInput;
