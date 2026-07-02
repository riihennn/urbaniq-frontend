import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IPropertyFilter } from '@/types/property';

interface PropertyFiltersProps {
  onFilterChange: (filters: IPropertyFilter) => void;
}

export function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [status, setStatus] = useState('');

  const handleApply = () => {
    onFilterChange({
      search: search || undefined,
      propertyType: propertyType || undefined,
      status: status || undefined,
    });
  };

  return (
    <div className="bg-card p-6 rounded-2xl border shadow-sm mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by city, state, or title..."
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 px-4 border rounded-lg bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={propertyType}
            onChange={(e) => {
              setPropertyType(e.target.value);
              onFilterChange({ search: search || undefined, propertyType: e.target.value || undefined, status: status || undefined });
            }}
          >
            <option value="">All Types</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Condo">Condo</option>
            <option value="Townhouse">Townhouse</option>
          </select>

          <select
            className="h-11 px-4 border rounded-lg bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              onFilterChange({ search: search || undefined, propertyType: propertyType || undefined, status: e.target.value || undefined });
            }}
          >
            <option value="">All Statuses</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
            <option value="Pending">Pending</option>
          </select>

          <Button onClick={handleApply} className="h-11 px-5 gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
