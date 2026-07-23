"use client";

import * as React from "react";
import { ChevronDownIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import dayjs from "dayjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export function DateRangePicker({
  date,
  onChange,
  placeholder,
  className,
}: {
  date: DateRange | undefined;
  onChange: (_?: DateRange) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  // const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className={cn(
            "border-input flex justify-between rounded-md border font-normal",
            className,
          )}
        >
          {date
            ? `${dayjs(date.from).format("MMM D, YYYY")} - ${dayjs(date.to).format("MMM D, YYYY")}`
            : placeholder || "Select date"}
          {date ? (
            <button
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              <X size={16} />
            </button>
          ) : (
            <ChevronDownIcon size={18} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
