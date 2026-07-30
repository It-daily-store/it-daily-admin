"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  value: string;
  label: string | React.ReactNode;
  disable?: boolean;
  searchValue: string;
}

export function Combobox({
  value = "",
  onChange,
  options,
  placeholder,
  className,
  allowDeselect = true,
  searchPlaceholder,
  emptyPlaceholder,
  extraContent,
}: {
  value: string;
  onChange: (_: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  allowDeselect?: boolean;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  extraContent?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const uniqueOptions = React.useMemo(() => {
    const seen = new Set<string>();
    return options?.filter((opt) => {
      if (seen.has(opt.value)) {
        return false;
      }
      seen.add(opt.value);
      return true;
    });
  }, [options]);

  console.log(options);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 justify-between font-normal items-center bg-background-foreground whitespace-nowrap w-full rounded-md border border-border-color px-3 py-2 text-sm shadow-none ring-offset-background placeholder:text-gray outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-gray",
            className,
          )}
        >
          {value
            ? options?.find((option) => option.value === value)?.label
            : placeholder || "Select Value"}
          {allowDeselect && value && (
            <div
              className="ms-auto"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange("");
              }}
            >
              <X size={16} />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder || "Search value"}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty className="text-gray text-center py-10">
              {emptyPlaceholder || "No options found."}
            </CommandEmpty>
            <CommandGroup>
              {uniqueOptions?.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.searchValue}
                  onSelect={(_currentValue) => {
                    onChange(framework.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer text-black"
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {extraContent}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
