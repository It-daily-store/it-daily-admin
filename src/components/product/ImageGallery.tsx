import React, {
  ChangeEvent,
  DragEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  useDeleteImagesMutation,
  useGetAllImagesQuery,
  useUploadImageMutation,
} from "@/redux/api/uploadFiles";
import { TImage } from "@/interface/image";
import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { toast } from "sonner";
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useGetFoldersQuery,
  useUpdateFolderMutation,
} from "@/redux/api/galleryFolderApi";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { globalError } from "@/lib/utils";
import DeleteModal from "../global/DeleteModal";
import useDebounce from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  ChevronRight,
  Folder,
  FolderPlus,
  ImageOff,
  ListChecks,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type TProp = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;

  onChange?: (ids: string[] | string) => void;
  multiselect?: boolean;
};

type TSelectedImages = {
  public_id: string;
  id: string;
  image: string;
};

export interface TGalleryFolder {
  _id: string;
  name: string;
  parent_id?: string | null;
}

type TFolderCrumb = {
  id: string;
  name: string;
};

type TUploadQueueItem = {
  id: string;
  name: string;
  progress: number;
  error: boolean;
};

const IMAGES_PER_PAGE = 20;

const ImageGallery = ({
  open,
  setOpen,
  onChange,
  multiselect = true,
}: TProp) => {
  const [selected, setSelected] = useState<TSelectedImages[]>([]);
  const [deleteImages, { isLoading: deletingImages }] =
    useDeleteImagesMutation();
  const [uploadImage] = useUploadImageMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const uploadImageRef = useRef<HTMLInputElement | null>(null);
  const [parentFolder, setParentFolder] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<TUploadQueueItem[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [accumulatedPhotos, setAccumulatedPhotos] = useState<TImage[]>([]);
  const filterKeyRef = useRef(`${parentFolder}::${debouncedSearch}`);

  const {
    data: folders,
    isLoading: isFolderLoading,
    error: folderFetchError,
  } = useGetFoldersQuery(parentFolder);
  const {
    data: photosResp,
    isLoading,
    isFetching,
    error,
  } = useGetAllImagesQuery({
    folder: parentFolder,
    search: debouncedSearch || undefined,
    page,
    limit: IMAGES_PER_PAGE,
  });
  const [updateFolder, { isLoading: isEditing }] = useUpdateFolderMutation();
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
  const [deleteFolder, { isLoading: isDeleting }] = useDeleteFolderMutation();
  const [addFolderModal, setAddFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState<TGalleryFolder | null>(null);

  const [folderCrumb, setFolderCrumb] = useState<TFolderCrumb[]>([
    {
      id: "",
      name: "home",
    },
  ]);

  if (open && error) {
    globalError(error);
  }
  if (open && folderFetchError) {
    globalError(folderFetchError);
  }

  // Reset back to page 1 whenever the active folder or search term changes.
  useEffect(() => {
    setPage(1);
  }, [parentFolder, debouncedSearch]);

  // Replace the accumulated list on filter changes / page 1, append on "load more".
  useEffect(() => {
    if (!photosResp) return;
    const key = `${parentFolder}::${debouncedSearch}`;
    if (filterKeyRef.current !== key || page === 1) {
      filterKeyRef.current = key;
      setAccumulatedPhotos(photosResp.data ?? []);
    } else {
      setAccumulatedPhotos((prev) => [...prev, ...(photosResp.data ?? [])]);
    }
    // Intentionally keyed only on photosResp — parentFolder/debouncedSearch/page
    // changes are read via refs/derived state above, not re-triggers here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosResp]);

  const hasMorePhotos = Boolean(photosResp?.pagination?.hasMore);

  const isSelected = (id: string) => selected.some((img) => img.id === id);

  const handleImageSelect = (img: TImage) => {
    if (multiselect) {
      if (isSelected(img._id)) {
        setSelected((prev) => prev.filter((image) => image.id !== img._id));
      } else {
        setSelected((prev) => [
          ...prev,
          { public_id: img.public_id, id: img._id, image: img.image },
        ]);
      }
    } else {
      setSelected(
        isSelected(img._id)
          ? []
          : [{ public_id: img.public_id, id: img._id, image: img.image }],
      );
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      const res = await deleteFolder(id).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      globalError(err);
    } finally {
      setDeleteFolderOpen(false);
      setActiveFolder(null);
    }
  };

  const handleDeleteImages = async () => {
    const public_ids: string[] = [];
    const database_ids: string[] = [];

    selected.forEach((item) => {
      public_ids.push(item.public_id);
      database_ids.push(item.id);
    });

    try {
      const res = await deleteImages({ public_ids, database_ids }).unwrap();
      if (res.success) {
        toast.success(res.message);
        setSelected([]);
        setDeleteModalOpen(false);
      }
    } catch (err) {
      globalError(err);
    }
  };

  const uploadOneFile = async (file: File, queueId: string) => {
    const formData = new FormData();
    formData.append("photos", file);
    formData.append("type", "product");
    formData.append("folder", parentFolder);

    try {
      await uploadImage({
        formData,
        onUploadProgress: (evt) => {
          const total = evt.total ?? file.size;
          const percent = total ? Math.round((evt.loaded / total) * 100) : 0;
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueId ? { ...item, progress: percent } : item,
            ),
          );
        },
      }).unwrap();

      setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
      setPage(1);
    } catch (err) {
      globalError(err);
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, error: true } : item,
        ),
      );
    }
  };

  const handleFilesSelected = (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length === 0) {
      toast.warning("Only image files can be uploaded");
      return;
    }

    const items: TUploadQueueItem[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      progress: 0,
      error: false,
    }));

    setUploadQueue((prev) => [...prev, ...items]);
    files.forEach((file, index) => uploadOneFile(file, items[index].id));
  };

  const handleUploadClick = () => uploadImageRef.current?.click();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleAdd = () => {
    const gallery: string[] = selected.map((item) => item.image);

    if (onChange) {
      onChange(multiselect ? gallery : gallery[0]);
      setOpen(false);
    } else {
      setOpen(false);
    }
  };

  const handleFolderNavigate = (id: string, name: string) => {
    setParentFolder(id);
    setFolderCrumb((prev) => [...prev, { id, name }]);
  };

  const handleAddFolder = async () => {
    try {
      const res = await createFolder({
        name: folderName,
        parent_id: parentFolder,
      }).unwrap();
      if (res.success) {
        setAddFolderModal(false);
        setFolderName("");
      } else {
        toast.error(res?.message);
      }
    } catch (err) {
      globalError(err);
    }
  };

  const handleEditFolder = async (id: string) => {
    if (!folderName) {
      toast.warning("Please write something");
      return;
    }
    try {
      const res = await updateFolder({ id, name: folderName }).unwrap();
      if (res.success) {
        toast.success(res.message);
        setEditOpen(false);
        setFolderName("");
        setActiveFolder(null);
      }
    } catch (err) {
      globalError(err);
    }
  };

  const handleCrumbClick = (item: TFolderCrumb, index: number) => {
    setParentFolder(item.id);
    setFolderCrumb((prev) => prev.slice(0, index + 1));
  };

  const renderFolders = (folderList: TGalleryFolder[]) => {
    return (
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setAddFolderModal(true)}
          className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-color bg-background-foreground text-gray transition-colors hover:border-primary hover:text-primary"
        >
          <FolderPlus size={22} />
          <span className="text-xs font-medium">New folder</span>
        </button>
        {folderList.map((folder) => (
          <div
            key={folder._id}
            onClick={() => handleFolderNavigate(folder._id, folder.name)}
            className="group relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border-color bg-background p-2 shadow-sm transition-shadow hover:shadow-md"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-1 top-1 rounded-md p-1 text-gray opacity-0 transition-opacity hover:bg-lavender-mist group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Options for ${folder.name}`}
                >
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={() => {
                    setFolderName(folder.name);
                    setActiveFolder(folder);
                    setEditOpen(true);
                  }}
                >
                  <Pencil size={14} /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setActiveFolder(folder);
                    setDeleteFolderOpen(true);
                  }}
                >
                  <Trash size={14} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Folder className="text-primary" size={36} />
            <p className="line-clamp-2 w-full text-center text-xs">
              {folder.name}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const uploadZone = (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleUploadClick}
      className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border-color bg-background-foreground hover:border-primary/60"
      }`}
    >
      <UploadCloud
        size={32}
        className={isDragging ? "text-primary" : "text-gray"}
      />
      <p className="text-sm font-medium">
        {isDragging ? "Drop images to upload" : "Drag & drop images here"}
      </p>
      <p className="text-xs text-gray">
        or <span className="text-primary">click to browse</span>
      </p>
      <input
        name="photos"
        onChange={handleImageUpload}
        ref={uploadImageRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*"
      />
    </div>
  );

  const uploadProgressList = uploadQueue.length > 0 && (
    <div className="flex flex-col gap-2">
      {uploadQueue.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 rounded-md border p-2 text-xs ${
            item.error
              ? "border-destructive/40 bg-destructive/5"
              : "border-border-color bg-background"
          }`}
        >
          <span className="w-1/3 truncate">{item.name}</span>
          {item.error ? (
            <span className="flex-1 text-destructive">Upload failed</span>
          ) : (
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lavender-mist">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
          {item.error && (
            <button
              type="button"
              onClick={() =>
                setUploadQueue((prev) => prev.filter((q) => q.id !== item.id))
              }
              className="text-gray hover:text-destructive"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[70vw]">
          <DialogTitle>Image gallery</DialogTitle>

          {selected.length > 0 && (
            <div className="sticky -top-6 z-50 flex items-center justify-between bg-background-foreground px-3 py-2">
              <h2 className="font-semibold">{selected.length} Selected</h2>

              <div className="flex gap-3">
                {onChange && (
                  <Button onClick={handleAdd} className="gap-2">
                    <Plus size={18} /> Add
                  </Button>
                )}
                <Button
                  variant={"edit"}
                  className="gap-2"
                  onClick={() => setSelected([])}
                >
                  <ListChecks /> Deselect All
                </Button>
                <Button
                  variant={"delete_solid"}
                  className="gap-2"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 /> Delete
                </Button>
                <DeleteModal
                  open={deleteModalOpen}
                  onOpenChange={setDeleteModalOpen}
                  onConfirm={handleDeleteImages}
                  isLoading={deletingImages}
                  title="Delete Photos?"
                  confirmText="Yes, delete it"
                >
                  <p className="text-gray">
                    Do you really want to delete this photos?
                  </p>
                </DeleteModal>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {folderCrumb.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {folderCrumb.map((item, index) => (
                      <BreadcrumbItem key={item.id}>
                        <BreadcrumbPage>
                          <div
                            className={`flex cursor-pointer items-center gap-1 ${item.id === parentFolder ? "font-medium text-primary" : ""}`}
                            onClick={() => handleCrumbClick(item, index)}
                          >
                            {item.name}
                            {index < folderCrumb.length - 1 && (
                              <ChevronRight size={12} />
                            )}
                          </div>
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}

              <div className="relative w-full max-w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search images"
                  className="pl-9"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-black"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {!isFolderLoading && !folderFetchError && folders?.data?.length ? (
              renderFolders(folders.data)
            ) : (
              <div
                onClick={() => setAddFolderModal(true)}
                className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-color bg-background-foreground text-gray transition-colors hover:border-primary hover:text-primary"
              >
                <FolderPlus size={22} />
                <span className="text-xs font-medium">New folder</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {uploadZone}
              {uploadProgressList}
            </div>

            {!isLoading && typeof error === "object" && (
              <h2 className="text-center text-sm text-gray">
                Could not get gallery images. Please try again later
              </h2>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-md bg-lavender-mist/50"
                  />
                ))}
              </div>
            ) : accumulatedPhotos.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-gray">
                <ImageOff size={28} />
                <p className="text-sm">
                  {debouncedSearch
                    ? `No images match "${debouncedSearch}"`
                    : "No images in this folder yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {accumulatedPhotos.map((imgData) => (
                    <div
                      key={imgData._id}
                      onClick={() => handleImageSelect(imgData)}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-border-color"
                    >
                      <Checkbox
                        checked={isSelected(imgData._id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageSelect(imgData);
                        }}
                        className={`${
                          isSelected(imgData._id) ? "visible" : "invisible"
                        } absolute left-2 top-2 z-10 size-5 bg-pure-white transition-all group-hover:visible`}
                      />
                      <Image
                        src={imgData.image}
                        alt={imgData.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <p className="invisible absolute bottom-0 z-10 w-full truncate bg-black/50 px-2 py-1 text-xs text-pure-white group-hover:visible">
                        {imgData.name}
                      </p>
                    </div>
                  ))}
                </div>

                {hasMorePhotos && (
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                    className="mx-auto gap-2"
                  >
                    {isFetching && (
                      <LoaderCircle size={16} className="animate-spin" />
                    )}
                    Load more
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ====================create folder dialog===================== */}
      <Dialog open={addFolderModal} onOpenChange={setAddFolderModal}>
        <DialogContent>
          <DialogTitle>Add new folder</DialogTitle>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              type="text"
            />
            <Button loading={isCreating} onClick={handleAddFolder}>
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ====================rename folder dialog===================== */}
      <Dialog
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next);
          if (!next) setActiveFolder(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Rename folder</DialogTitle>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              type="text"
            />
            <Button
              loading={isEditing}
              onClick={() => activeFolder && handleEditFolder(activeFolder._id)}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteModal
        open={deleteFolderOpen}
        onOpenChange={(next) => {
          setDeleteFolderOpen(next);
          if (!next) setActiveFolder(null);
        }}
        onConfirm={() => activeFolder && handleDeleteFolder(activeFolder._id)}
        isLoading={isDeleting}
        title="Delete folder"
      >
        <h2 className="text-red-orange">Warning!</h2>
        <p className="text-sm text-gray">
          This is a destructive action and cannot be undone.
        </p>
      </DeleteModal>
    </>
  );
};

export default ImageGallery;
