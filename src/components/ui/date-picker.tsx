"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, X } from "lucide-react";
import dayjs from "dayjs";

interface DatePickerDemoProps {
  value?: Date | null;
  onChange?: (_: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  withTime?: boolean;
  bordered?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
  calendarClassName?: string;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date",
  disabled = false,
  bordered = false,
  disableFuture = false,
  disablePast,
  withTime = false,
  calendarClassName,
}: DatePickerDemoProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? value : undefined,
  );
  const [open, setOpen] = React.useState(false);

  // const handleDateSelect = (newDate: Date | undefined) => {
  //   const dayjsDate = newDate ? newDate : undefined;
  //   setDate(dayjsDate);
  //   onChange?.(dayjsDate);
  //   setOpen(false);
  // };

  React.useEffect(() => {
    if (value) {
      setDate(value);
    } else {
      setDate(undefined);
    }
  }, [value]);

  const isDateDisabled = (currentDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    if (disableFuture && currentDate > today) {
      return true; // block future dates
    }
    if (disablePast && currentDate < today) {
      return true; // block past dates
    }
    return false;
  };

  const [time, setTime] = React.useState("00:00"); // HH:mm format

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined);
      onChange?.(undefined);
      return;
    }
    const [hours, minutes] = time.split(":").map(Number);
    newDate.setHours(hours, minutes, 0, 0);

    setDate(newDate);
    onChange?.(newDate);
    setOpen(false);
  };

  const handleClearDate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange?.(undefined);
    setDate(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={bordered ? "bordered" : "plain"}
          className={cn(
            `relative min-h-10 w-full justify-start bg-background-foreground text-left text-sm font-normal text-dark-gray`,
            !date && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarDays className="mr-1 h-[14px] w-[14px] text-dark-gray" />
          {date ? (
            dayjs(date).format("DD MMM YYYY, hh:mm A")
          ) : (
            <span className="text-dark-gray">{placeholder}</span>
          )}

          {date && (
            <button
              onClick={handleClearDate}
              className="absolute right-2 bg-transparent"
            >
              <X size={16} />
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-auto border bg-background p-0 ${calendarClassName}`}
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          disabled={(date) => disabled || isDateDisabled(date)}
        />
        {withTime && (
          <div className="p-2 border-t">
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (date) {
                  const [h, m] = e.target.value.split(":").map(Number);
                  const updated = new Date(date);
                  updated.setHours(h, m, 0, 0);
                  setDate(updated);
                  onChange?.(updated);
                }
              }}
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
