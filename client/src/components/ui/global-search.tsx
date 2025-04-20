
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "./command";
import { ServiceCategory, Service } from "@shared/schema";
import { Search } from "lucide-react";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [_, setLocation] = useLocation();

  const { data: categories } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/service-categories"],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services?.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-primary transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-neutral-100 px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Command
        className="rounded-lg border shadow-md"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CommandInput 
          placeholder="Search categories and services..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {filteredCategories && filteredCategories.length > 0 && (
            <CommandGroup heading="Categories">
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  onSelect={() => {
                    setLocation(`/services?category=${category.id}`);
                    setIsOpen(false);
                  }}
                >
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {filteredServices && filteredServices.length > 0 && (
            <CommandGroup heading="Services">
              {filteredServices.map((service) => (
                <CommandItem
                  key={service.id}
                  onSelect={() => {
                    setLocation(`/services?service=${service.id}`);
                    setIsOpen(false);
                  }}
                >
                  {service.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </>
  );
}
