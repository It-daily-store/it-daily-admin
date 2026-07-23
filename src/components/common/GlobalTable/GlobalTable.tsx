"use client";
import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  flexRender,
  type Table,
  type RowSelectionState,
  TableMeta,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import SimpleBar from "simplebar-react";
import { Settings } from "lucide-react";
import ColumnSettingsModal from "./ColumnSettingsModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setColumnSizing } from "@/redux/reducers/tableCollumn/tableReducer";
import EmptyData from "./EmptyData";

function TableBody<T>({
  table,
  isLoading,
  limit,
  totalColumn,
}: {
  table: Table<T>;
  isLoading?: boolean;
  limit?: number;
  totalColumn: number;
}) {
  const [totalWidth, setTotalWidth] = useState(table.getTotalSize());
  const { tableSizeData } = useAppSelector((s) => s?.table);

  useEffect(() => {
    setTotalWidth(table.getTotalSize());
  }, [table, tableSizeData]);

  return (
    <div
      {...{
        className: "tbody",
      }}
    >
      {isLoading ? (
        <div className="">
          {Array.from({ length: limit || 0 }, (_, i: number) => (
            <div
              key={`loading-row-${i}`}
              className="border-border-color flex h-14 w-full items-center space-x-4 border-b"
            >
              {Array.from({ length: totalColumn }, (_, j: number) => {
                const randomWidth =
                  Math.floor(Math.random() * (150 - 100 + 1)) + 100;
                return (
                  <div
                    key={`loading-cell-${i}-${j}`}
                    className="border-border-color flex h-full flex-1 items-center overflow-hidden border-r"
                  >
                    <div
                      className="bg-background-foreground relative h-6 overflow-hidden rounded-md"
                      style={{
                        width: `${randomWidth}px`,
                      }}
                    >
                      <div className="bg-background-foreground from-background-foreground via-background to-background-foreground absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <>
          {table.getRowModel().rows.map((row) => {
            const visibleCells = row.getVisibleCells();
            const lastCellIndex = visibleCells.length - 1;

            return (
              <div key={row.id} className="group flex min-h-[50px]">
                {visibleCells.map((cell, i) => {
                  const isLastCell = i === lastCellIndex;
                  const column = table.getColumn(cell.column.id);
                  if (!column) {
                    return null;
                  }
                  const columnWidth = isLastCell
                    ? `calc(100% - ${totalWidth - column?.getSize() || 0}px)`
                    : `calc(var(--col-${cell.column.id}-size) * 1px)`;

                  return (
                    <div
                      key={cell.id}
                      className={cn(
                        "border-border-color group-hover:bg-sidebar flex items-center border-r border-b p-2 transition-colors duration-150 first-of-type:border-l-0",
                        isLastCell && "border-r-0 pr-2",
                        {
                          "pr-0": cell.id === "action",
                        },
                      )}
                      style={{ width: columnWidth }}
                    >
                      <div
                        className={`w-full overflow-hidden text-sm text-black ${typeof cell.column.columnDef.cell === "string" && "truncate"}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell || "-",
                          cell.getContext(),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export const MemoizedTableBody = React.memo(
  TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data,
) as typeof TableBody;

export type TCustomColumnDef<T> = ColumnDef<T & { serial?: number }> & {
  visible: boolean;
  canHide?: boolean;
  id: keyof T | "actions" | "serial";
  accessorKey: keyof T | "actions" | "serial";
  dataType?: string;
  title?: string;
};

interface GlobalTableProps<T> {
  tableName: string;
  defaultColumns: TCustomColumnDef<T>[];
  data: (T & { serial?: number })[];
  height?: string;
  isLoading?: boolean;
  limit?: number;
  showAddColumn?: boolean;
  enableRowSelection?: boolean; // New prop to enable/disable row selection
  onRowSelectionChange?: (selectedRows: T[]) => void; // Callback for selected rows
  meta?: TableMeta<T & { serial?: number }>;
}

const GlobalTable = <T,>({
  tableName,
  defaultColumns,
  isLoading,
  data,
  height,
  limit,
  showAddColumn = true,
  enableRowSelection = false, // Default to false for backward compatibility
  onRowSelectionChange,
  meta,
}: GlobalTableProps<T>) => {
  const [columnSettingsOpen, setCollumnSettings] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { tableSizeData } = useAppSelector((s) => s.table);
  const dispatch = useAppDispatch();

  const storeColumnSizing = tableSizeData.find(
    (d) => d.tableName === tableName,
  );

  // Add selection column if row selection is enabled
  const columnsWithSelection = React.useMemo(() => {
    if (!enableRowSelection) {
      return defaultColumns;
    }

    const selectionColumn: TCustomColumnDef<T> = {
      id: "rowSelect" as any,
      accessorKey: "select" as keyof T,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      title: "Row Selection",
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      visible: true,
      canHide: false,
      minSize: 50,
      maxSize: 50,
    };

    return [selectionColumn, ...defaultColumns];
  }, [defaultColumns, enableRowSelection]);

  const mergedColumns = React.useMemo(() => {
    // Create a lookup for store columns by id
    const storeColumnsMap = new Map(
      storeColumnSizing?.columns?.map((col: TCustomColumnDef<any>) => [
        col.id,
        col,
      ]),
    );

    // Map default columns, apply store settings, and filter out invisible ones
    return columnsWithSelection
      .map((col) => {
        if (storeColumnsMap.has(col.id)) {
          return {
            ...col,
            ...storeColumnsMap.get(col.id), // apply stored settings
          };
        }
        return { ...col, visible: true }; // Ensure new columns are visible by default
      })
      .filter((col) => col.visible !== false); // Remove columns where visible is false
  }, [storeColumnSizing, columnsWithSelection]);

  const columnsWithCustomSizing = React.useMemo(() => {
    return mergedColumns.map((column) => {
      if (column.id === "select") {
        return {
          ...column,
          size: 50,
          minSize: 50,
          maxSize: 50,
        };
      }
      return column;
    });
  }, [mergedColumns]);

  const table = useReactTable({
    data,
    columns: columnsWithCustomSizing,
    defaultColumn: {
      minSize: 100,
      maxSize: 600,
    },
    state: {
      columnSizing: storeColumnSizing?.columnSizing || {},
      rowSelection,
    },
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: (updater) => {
      dispatch(
        setColumnSizing({
          tableName,
          columnSizing:
            typeof updater === "function"
              ? updater(storeColumnSizing?.columnSizing || {})
              : updater,
          columns:
            (storeColumnSizing?.columns as TCustomColumnDef<any>[]) || [],
        }),
      );
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
    meta,
  });

  // Call the callback when row selection changes
  useEffect(() => {
    if (enableRowSelection && onRowSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, enableRowSelection]);

  useEffect(() => {
    if (!storeColumnSizing) {
      dispatch(
        setColumnSizing({
          tableName,
          columnSizing: table.getState().columnSizing,
          columns: columnsWithSelection,
        }),
      );
    } else {
      dispatch(
        setColumnSizing({
          tableName,
          columnSizing: storeColumnSizing.columnSizing,
          columns: columnsWithSelection?.map((col) => {
            const found = storeColumnSizing?.columns?.find(
              (c) => c.id === col.id,
            );
            if (found) {
              return {
                ...col,
                visible: found.visible,
              };
            } else {
              return col;
            }
          }),
        }),
      );
    }
  }, [defaultColumns]);

  const columnSizeVars = React.useMemo(() => {
    const headers = table?.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  const enableMemo = React.useRef(true);

  return (
    <SimpleBar
      forceVisible="x"
      autoHide={false}
      className={cn("max-h-[calc(100vh-178px)] min-h-48", height)}
    >
      <div>
        <div
          className="min-w-full"
          {...{
            style: {
              ...columnSizeVars,
              width: table.getTotalSize(),
            },
          }}
        >
          <div
            className={
              !isLoading && table.getRowModel().rows.length === 0
                ? "hidden"
                : "thead bg-sidebar sticky top-0 z-50 shadow-sm"
            }
          >
            <div className="relative flex">
              {table.getHeaderGroups().map((headerGroup, i) => (
                <div key={headerGroup.id} className="flex h-12">
                  {headerGroup.headers.map((header) => (
                    <div
                      key={header.id}
                      className={
                        "text-black relative flex h-full items-center p-2 text-sm"
                      }
                      style={{
                        width:
                          i === 5
                            ? "100%"
                            : `calc(var(--header-${header?.id}-size) * 1px)`,
                      }}
                    >
                      <div className="w-full truncate text-start capitalize">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </div>
                      {header.column.id !== "select" && (
                        <div
                          className={cn(
                            "hover:border-primary border-border-color absolute top-0 right-0 h-full w-2 cursor-col-resize touch-none truncate select-none hover:border-r-2",
                            header.column.getIsResizing()
                              ? "border-primary opacity-100"
                              : "",
                          )}
                          {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Only show the Add Column button if showAddColumn is true */}
              {showAddColumn && (
                <div className="sticky top-0 right-0 flex w-full items-center justify-end shadow-sm">
                  <Button
                    variant={"plain"}
                    tooltip="Customize Columns"
                    onClick={() => setCollumnSettings(true)}
                    className="text-gray bg-background-foreground z-40 sm:p-0 flex h-12 w-9 items-center justify-center rounded-none border-none border-b hover:bg-transparent"
                  >
                    <Settings className="text-dark-gray" size={20} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <>
            {!isLoading && table.getRowModel().rows.length === 0 ? (
              <div className="flex w-[calc(100%)] justify-center py-4">
                <EmptyData />
              </div>
            ) : table.getState().columnSizingInfo.isResizingColumn &&
              enableMemo ? (
              <MemoizedTableBody
                totalColumn={columnsWithSelection?.length}
                isLoading={isLoading}
                table={table}
                limit={limit}
              />
            ) : (
              <TableBody
                totalColumn={columnsWithSelection?.length}
                isLoading={isLoading}
                table={table}
                limit={limit}
              />
            )}
          </>
        </div>

        {/* Only render the column settings modal if showAddColumn is true */}
        {showAddColumn && (
          <ColumnSettingsModal
            table={table}
            tableName={tableName}
            open={columnSettingsOpen}
            setOpen={setCollumnSettings}
          />
        )}
      </div>
    </SimpleBar>
  );
};

export default GlobalTable;
