import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import GlobalModal from "../GlobalModal";
import { Button } from "@/components/ui/button";
import CrossCircle from "@/components/svgs/common/CrossCircle";
import SaveIcon from "@/components/svgs/common/SavedIcon";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ColumnDef, ColumnSizingState, Table } from "@tanstack/react-table";
import RightArrowCircle from "@/components/svgs/common/RightArrowCircle";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import DragIcon from "@/components/svgs/common/DragIcon";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import { EyeOff, GripVertical } from "lucide-react";
import { TCustomColumnDef } from "./GlobalTable";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setColumnSizing } from "@/redux/reducers/tableCollumn/tableReducer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

type TProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  tableName: string;
  table: Table<any>;
};

type ColumnProps = {
  id: string;
  children: ReactNode;
};

function Column({ id, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full w-full rounded-lg transition-colors`}
    >
      {children}
    </div>
  );
}

const DraggableItem = ({
  col,
  preview = false,
  onClick,
  table,
}: {
  col: TCustomColumnDef<any>;
  preview?: boolean;
  onClick?: () => void;
  table: Table<any>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    isDragging,
    transform,
  } = useSortable({
    id: col.id as string,
    data: {
      type: "column",
      col,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex h-10 w-full gap-3 transition-all duration-200"
      >
        <div className="size-6"></div>
        <div className="bg-row-line h-full w-full rounded-lg"></div>
        <div className="size-3"></div>
      </div>
    );
  }

  return (
    <div
      style={style}
      {...attributes}
      ref={setNodeRef}
      className={cn("flex h-10 w-full items-center gap-3 overflow-y-auto")}
    >
      <Button
        size={"icon"}
        variant={"secondary"}
        className="hidden cursor-move lg:flex"
        {...listeners}
      >
        <GripVertical className="text-dark-gray" />
      </Button>
      <p
        className={cn(
          "bg-background-foreground border-forground-border text-dark-gray flex h-full w-full items-center rounded-lg border p-3 text-sm",
          isDragging && "bg-row-line shadow-md",
          preview && "border-primary",
        )}
      >
        {typeof col.header === "function" ? col?.title : col.header}
      </p>
      <Button onClick={onClick} variant={"plain"} size={"icon"}>
        <CrossCircle />
      </Button>
    </div>
  );
};

const ColumnSettingsModal = ({ open, setOpen, tableName, table }: TProps) => {
  const { tableSizeData } = useAppSelector((s) => s.table);
  const dispatch = useAppDispatch();
  const columnData = tableSizeData.find((d) => d.tableName === tableName);
  const [localColumns, setLocalColumns] = useState(columnData?.columns || []);
  const [activeColumn, setActiveColumn] =
    useState<TCustomColumnDef<any> | null>(null);
  const [isdragging, setIsDragging] = useState(false);

  const findIndex = (id: string | number) => {
    const index = localColumns.findIndex((c) => c.id === id);
    return index;
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = e;
    if (active.id === over?.id) {
      return;
    }

    if (over?.id === "hidden") {
      setLocalColumns((prev) =>
        prev.map((c) => {
          if (c.id === active.id) {
            return {
              ...c,
              visible: false,
            };
          } else {
            return c;
          }
        }),
      );

      return;
    }

    if (!over) {
      return;
    }

    const pos = findIndex(active.id);
    const newPos = findIndex(over?.id);

    const newColumns = arrayMove(localColumns, pos, newPos);

    setLocalColumns(newColumns);
  };

  const handleSave = () => {
    dispatch(
      setColumnSizing({
        tableName: tableName,
        columnSizing: (columnData?.columnSizing as ColumnSizingState) || [],
        columns: localColumns,
      }),
    );
    setOpen(false);
  };

  useEffect(() => {
    if (columnData?.columns) {
      setLocalColumns(columnData?.columns);
    }
  }, [columnData?.columns]);

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    setIsDragging(true);
    setActiveColumn(e.active.data?.current?.col);
  };

  console.log({ localColumns });

  return (
    <GlobalModal
      className="h-[60vh] sm:min-w-[90vw] z-50 md:min-w-[70vw] lg:min-w-[60vw] xl:min-w-[50vw]"
      title={"Customize Columns "}
      subTitle="Adjust and organize columns"
      buttons={
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} variant={"default"}>
            <SaveIcon className="stroke-pure-white" />
            Save Changes
          </Button>
        </div>
      }
      open={open}
      setOpen={(v) => setOpen(v)}
    >
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
      >
        <div className="grid h-full grid-cols-1 gap-3 pt-3 md:grid-cols-2 md:gap-0">
          <Column id="hidden">
            <SortableContext
              items={localColumns
                .filter((c) => c.visible === false && c.id !== "rowSelect")
                .map((d) => ({
                  ...d,
                  id: d.id as string,
                }))}
              strategy={verticalListSortingStrategy}
            >
              <div key={"left"} className="h-full">
                {isdragging ? (
                  <div className="bg-sidebar text-dark-gray border-secondary-border mr-3 flex h-full border-spacing-1 items-center justify-center gap-1 rounded-md border-2 border-dotted text-sm">
                    <EyeOff size={18} /> Hide Column
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-black">
                      Hidden Fields
                    </h3>

                    <div className="pt-1 md:pr-2">
                      {localColumns
                        .filter(
                          (c) => c.visible === false && c.id !== "rowSelect",
                        )
                        ?.map((col, i) => (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: -10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              y: -10,
                            }}
                            transition={{
                              duration: 0.3,
                            }}
                            key={i}
                            className="text-dark-gray flex items-center justify-between text-sm"
                          >
                            <p>
                              {typeof col.header === "function"
                                ? col?.title
                                : col.header}
                            </p>
                            <Button
                              variant={"plain"}
                              className="border-0"
                              onClick={() =>
                                setLocalColumns((prev) =>
                                  prev.map((c) => {
                                    if (c.id === col.id) {
                                      return {
                                        ...col,
                                        visible: true,
                                      };
                                    } else {
                                      return c;
                                    }
                                  }),
                                )
                              }
                            >
                              <RightArrowCircle />
                            </Button>
                          </motion.div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </SortableContext>
          </Column>

          <Column id="visible">
            <SortableContext
              items={localColumns
                .filter((c) => c.visible === true && c.id !== "rowSelect")
                .map((d) => ({
                  ...d,
                  id: d.id as string,
                }))}
              strategy={verticalListSortingStrategy}
            >
              <div className="border-forground-border h-full w-full ps-2 pb-3 md:border-l md:ps-3">
                <h3 className="pb-3 text-sm font-medium text-black">
                  Visible Fields
                </h3>

                <div className="space-y-2">
                  <div className="space-y-2 pb-3">
                    {localColumns
                      .filter(
                        (c) =>
                          c.visible === true &&
                          c.canHide === false &&
                          c.id !== "rowSelect",
                      )
                      .map((col) => (
                        <div
                          key={col.id}
                          className="flex h-10 items-center gap-3"
                        >
                          <div className="hidden size-7 lg:flex"></div>
                          <p
                            className={cn(
                              "bg-background-foreground border-forground-border text-dark-gray flex h-full w-full items-center rounded-lg border p-3 text-sm",
                            )}
                          >
                            {typeof col.header === "function" ? "" : col.header}
                          </p>
                          <div className="size-9"></div>
                        </div>
                      ))}
                  </div>
                  {localColumns
                    .filter((c) => c.visible === true && c.canHide !== false)
                    ?.map((col) => {
                      return (
                        <DraggableItem
                          table={table}
                          onClick={() =>
                            setLocalColumns((prev) =>
                              prev.map((c) => {
                                if (c.id === col.id) {
                                  return {
                                    ...col,
                                    visible: false,
                                  };
                                } else {
                                  return c;
                                }
                              }),
                            )
                          }
                          key={col.id}
                          col={col}
                        />
                      );
                    })}
                </div>
              </div>
            </SortableContext>
          </Column>
        </div>

        <DragOverlay>
          {activeColumn && (
            <DraggableItem table={table} preview={true} col={activeColumn} />
          )}
        </DragOverlay>
      </DndContext>
    </GlobalModal>
    // <AlertDialog
    //   open={open}
    //   onOpenChange={(v) => setOpen(v)}
    // >
    //   <AlertDialogContent>
    //     <AlertDialogCancel />
    //     <DndContext
    //       sensors={sensors}
    //       onDragEnd={handleDragEnd}
    //       collisionDetection={closestCenter}
    //       onDragStart={handleDragStart}
    //     >
    //       <div className="grid h-full grid-cols-1 gap-3 pt-3 md:grid-cols-2 md:gap-0">
    //         <Column id="hidden">
    //           <SortableContext
    //             items={localColumns
    //               .filter((c) => c.visible === false && c.id !== "rowSelect")
    //               .map((d) => ({
    //                 ...d,
    //                 id: d.id as string,
    //               }))}
    //             strategy={verticalListSortingStrategy}
    //           >
    //             <div key={"left"} className="h-full">
    //               {isdragging ? (
    //                 <div className="bg-sidebar text-dark-gray border-secondary-border mr-3 flex h-full border-spacing-1 items-center justify-center gap-1 rounded-md border-2 border-dotted text-sm">
    //                   <EyeOff size={18} /> Hide Column
    //                 </div>
    //               ) : (
    //                 <>
    //                   <h3 className="text-sm font-medium text-black">
    //                     Hidden Fields
    //                   </h3>

    //                   <div className="pt-1 md:pr-2">
    //                     {localColumns
    //                       .filter(
    //                         (c) => c.visible === false && c.id !== "rowSelect",
    //                       )
    //                       ?.map((col, i) => (
    //                         <motion.div
    //                           initial={{
    //                             opacity: 0,
    //                             y: -10,
    //                           }}
    //                           animate={{
    //                             opacity: 1,
    //                             y: 0,
    //                           }}
    //                           exit={{
    //                             opacity: 0,
    //                             y: -10,
    //                           }}
    //                           transition={{
    //                             duration: 0.3,
    //                           }}
    //                           key={i}
    //                           className="text-dark-gray flex items-center justify-between text-sm"
    //                         >
    //                           <p>
    //                             {typeof col.header === "function"
    //                               ? col?.title
    //                               : col.header}
    //                           </p>
    //                           <Button
    //                             variant={"plain"}
    //                             className="border-0"
    //                             onClick={() =>
    //                               setLocalColumns((prev) =>
    //                                 prev.map((c) => {
    //                                   if (c.id === col.id) {
    //                                     return {
    //                                       ...col,
    //                                       visible: true,
    //                                     };
    //                                   } else {
    //                                     return c;
    //                                   }
    //                                 }),
    //                               )
    //                             }
    //                           >
    //                             <RightArrowCircle />
    //                           </Button>
    //                         </motion.div>
    //                       ))}
    //                   </div>
    //                 </>
    //               )}
    //             </div>
    //           </SortableContext>
    //         </Column>

    //         <Column id="visible">
    //           <SortableContext
    //             items={localColumns
    //               .filter((c) => c.visible === true && c.id !== "rowSelect")
    //               .map((d) => ({
    //                 ...d,
    //                 id: d.id as string,
    //               }))}
    //             strategy={verticalListSortingStrategy}
    //           >
    //             <div className="border-forground-border h-full w-full ps-2 pb-3 md:border-l md:ps-3">
    //               <h3 className="pb-3 text-sm font-medium text-black">
    //                 Visible Fields
    //               </h3>

    //               <div className="space-y-2">
    //                 <div className="space-y-2 pb-3">
    //                   {localColumns
    //                     .filter(
    //                       (c) =>
    //                         c.visible === true &&
    //                         c.canHide === false &&
    //                         c.id !== "rowSelect",
    //                     )
    //                     .map((col) => (
    //                       <div
    //                         key={col.id}
    //                         className="flex h-10 items-center gap-3"
    //                       >
    //                         <div className="hidden size-7 lg:flex"></div>
    //                         <p
    //                           className={cn(
    //                             "bg-background-foreground border-forground-border text-dark-gray flex h-full w-full items-center rounded-lg border p-3 text-sm",
    //                           )}
    //                         >
    //                           {typeof col.header === "function" ? "" : col.header}
    //                         </p>
    //                         <div className="size-9"></div>
    //                       </div>
    //                     ))}
    //                 </div>
    //                 {localColumns
    //                   .filter((c) => c.visible === true && c.canHide !== false)
    //                   ?.map((col) => {
    //                     return (
    //                       <DraggableItem
    //                         table={table}
    //                         onClick={() =>
    //                           setLocalColumns((prev) =>
    //                             prev.map((c) => {
    //                               if (c.id === col.id) {
    //                                 return {
    //                                   ...col,
    //                                   visible: false,
    //                                 };
    //                               } else {
    //                                 return c;
    //                               }
    //                             }),
    //                           )
    //                         }
    //                         key={col.id}
    //                         col={col}
    //                       />
    //                     );
    //                   })}
    //               </div>
    //             </div>
    //           </SortableContext>
    //         </Column>
    //       </div>

    //       <DragOverlay>
    //         {activeColumn && (
    //           <DraggableItem table={table} preview={true} col={activeColumn} />
    //         )}
    //       </DragOverlay>
    //     </DndContext>
    //   </AlertDialogContent>
    // </AlertDialog>
  );
};

export default ColumnSettingsModal;
