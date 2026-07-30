"use client";

import * as React from "react";
import { Check, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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

export type Option = {
  value: string;
  label: string | React.ReactNode;
  searchValue: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  onRemove?: (val: string[], removed: string) => void;
  readOnly?: boolean;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  onRemove,
  readOnly = false,
  searchPlaceholder = "Search options...",
  emptyPlaceholder = "No options found.",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (value: string) => {
      const updatedSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      onChange(updatedSelected);
    },
    [selected, onChange],
  );

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>, v: string) => {
    e.stopPropagation();
    const newValue = selected?.filter((val) => v !== val);

    // Use specialized handler if available
    if (onRemove) {
      onRemove(newValue, v);
    } else {
      onChange(newValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={readOnly} asChild>
        <div
          className={cn(
            "w-full bg-background cursor-pointer min-h-10 items-center flex gap-1 flex-wrap p-1 rounded-md border border-border-color max-h-[100px] overflow-y-auto",
            className,
          )}
        >
          {selected.length > 0 ? (
            selected.map((v, i) => (
              <div
                className="bg-background text-sm text-gray w-fit flex gap-1 items-center shadow-sm rounded-sm px-2 py-1"
                key={i}
              >
                {options?.find((op) => op.value === v)?.label}
                <button
                  type="button"
                  className="cursor-pointer w-fit"
                  onClick={(e) => handleRemove(e, v)}
                >
                  <XIcon size={14} />
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray text-sm px-2">
              {placeholder || "Select options"}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  className="text-black cursor-pointer"
                  key={option.value}
                  value={option.searchValue}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
