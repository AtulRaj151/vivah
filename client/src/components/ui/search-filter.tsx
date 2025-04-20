
import { useState } from "react";
import { Input } from "./input";
import { Select } from "./select";

export function SearchFilter({ onSearch, onFilter }: {
  onSearch: (term: string) => void;
  onFilter: (type: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex gap-4 mb-8">
      <Input
        placeholder="Search photographers..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onSearch(e.target.value);
        }}
        className="max-w-sm"
      />
      <Select onValueChange={onFilter}>
        <option value="">All Events</option>
        <option value="wedding">Wedding</option>
        <option value="engagement">Engagement</option>
        <option value="pre-wedding">Pre-Wedding</option>
      </Select>
    </div>
  );
}
