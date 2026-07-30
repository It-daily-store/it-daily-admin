import React, {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  useDeleteImagesMutation,
  useGetAllImagesQuery,
  useUploadImageMutation,
} from "@/redux/api/uploadFiles";
import { TImage } from "@/interface/image";
import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

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
import { Input } from "../ui/input";
import { globalError } from "@/lib/utils";
import DeleteModal from "../global/DeleteModal";
import {
  ChevronRight,
  Cloudy,
  Folder,
  FolderPlus,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  Trash,
  Trash2,
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

const ImageGallery = ({
  open,
  setOpen,
  onChange,
  multiselect = true,
}: TProp) => {
  const [selected, setSelected] = useState<TSelectedImages[]>([]);
  const [deleteImages, { isLoading: deletingImages }] =
    useDeleteImagesMutation();
  const [uploadImage, { isLoading: isUploadLoading }] =
    useUploadImageMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const uploadImageRef = useRef<HTMLInputElement | null>(null);
  const [parentFolder, setParentFolder] = useState("");
  const {
    data: folders,
    isLoading: isFolderLoading,
    refetch: refetchFolders,
    error: folderFetchError,
  } = useGetFoldersQuery(parentFolder);
  const {
    data: photos,
    isLoading,
    error,
    refetch: refetchGallery,
  } = useGetAllImagesQuery(parentFolder);
  const [updateFolder, { isLoading: isEditing }] = useUpdateFolderMutation();
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
  const [deleteFolder, { isLoading: isDeleting }] = useDeleteFolderMutation();
  const [addFolderModal, setAddFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState<string | null>(null);

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

  const handleImageSelect = (img: TImage) => {
    if (multiselect) {
      if (isSelected(img._id)) {
        setSelected((prev) =>
          prev.filter((image: TSelectedImages) => image.id !== img._id),
        );
      } else {
        setSelected((prev) => [
          ...prev,
          {
            public_id: img.public_id,
            id: img._id,
            image: img.image,
          },
        ]);
      }
    } else {
      if (isSelected(img._id)) {
        setSelected([]);
      } else {
        setSelected([
          {
            public_id: img.public_id,
            id: img._id,
            image: img.image,
          },
        ]);
      }
    }
  };

  useEffect(() => {
    refetchFolders();
    refetchGallery();
  }, [parentFolder, refetchFolders, refetchGallery]);

  const isSelected = (id: string) => {
    const exist = selected.find((img: TSelectedImages) => img.id === id);

    if (exist) {
      return true;
    }
    return false;
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
    }
  };

  const handleDeleteImages = async () => {
    const public_ids: string[] = [];
    const database_ids: string[] = [];

    selected.forEach((item: TSelectedImages) => {
      public_ids.push(item.public_id);
      database_ids.push(item.id);
    });

    try {
      const res = await deleteImages({
        public_ids,
        database_ids,
      }).unwrap();
      if (res.success) {
        toast.success(res.message);
        setSelected([]);
        setDeleteModalOpen(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUploadClick = () => {
    if (uploadImageRef && uploadImageRef.current) {
      uploadImageRef.current.click();
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const formData = new FormData();
      Array.from(e.target.files).forEach((file) => {
        formData.append("photos", file);
      });

      formData.append("type", "product");
      formData.append("folder", parentFolder);

      try {
        const res = await uploadImage(formData).unwrap();

        toast.success(res.message);
      } catch (err) {
        globalError(err);
        console.error("Error uploading images:", err); // Handle the error
      }
    }
  };

  const handleAdd = () => {
    const gallery: string[] = selected.map(
      (item: TSelectedImages) => item.image,
    );

    if (onChange) {
      onChange(multiselect ? gallery : gallery[0]);
      setOpen(false);
    } else {
      // dispatch(updateProduct({ key: "gallery", value: gallery }));
      setOpen(false);
    }
  };

  const handleFolderClick = (id: string, name: string) => {
    setParentFolder(id);
    const exist = folderCrumb.find((item) => item.id === id);
    if (exist) {
      setFolderCrumb((prev) => prev.filter((item) => item.id !== id));
    } else {
      setFolderCrumb((prev) => [...prev, { id, name }]);
    }
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
      console.log(err);
      globalError(err);
    }
  };

  const handleEditFolder = async (id: string) => {
    if (folderName) {
      try {
        const res = await updateFolder({
          id,
          name: folderName,
        }).unwrap();
        if (res.success) {
          toast.success(res.message);
          setEditOpen(false);
          setFolderName("");
          setContextOpen(null);
        }
      } catch (err) {
        console.log(err);
        toast.error("Update failed, please try again later");
      }
    } else {
      toast.warning("Please write something");
    }
  };

  const handleContextMenu = (
    e: MouseEvent<HTMLDivElement>,
    folder: TGalleryFolder,
  ) => {
    e.preventDefault();
    if (contextOpen === folder._id) {
      setContextOpen(null);
      setFolderName("");
    } else {
      setContextOpen(folder._id);
      setFolderName(folder.name);
    }
  };

  const renderFolders = (folders: TGalleryFolder[]) => {
    return (
      <div className="flex flex-wrap gap-5">
        <div
          onClick={() => setAddFolderModal(true)}
          className="flex size-32 flex-col items-center justify-center gap-2 rounded-md bg-lavender-mist"
        >
          <FolderPlus className="text-gray" size={25} />
          <p className="text-sm">Add Folder</p>
        </div>
        {folders.map((folder: TGalleryFolder) => {
          return (
            <div
              onContextMenu={(e) => handleContextMenu(e, folder)}
              onTouchEnd={() => handleFolderClick(folder._id, folder.name)}
              onDoubleClick={() => handleFolderClick(folder._id, folder.name)}
              key={folder._id}
              className="relative flex min-h-32 w-32 flex-col items-center justify-center gap-2 rounded-md bg-background p-2 text-black shadow-sm"
            >
              <Folder className="text-gray" size={40} />
              <p className="line-clamp-2 text-ellipsis text-xs">
                {folder.name}
              </p>

              {contextOpen && contextOpen === folder._id && (
                <div className="absolute bottom-0 flex w-full justify-between transition-all">
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger>
                      <Button variant={"icon"} className="text-sm">
                        <Pencil />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Edit folder name</DialogTitle>
                      <div className="flex flex-col gap-4">
                        <Input
                          placeholder="folder name"
                          defaultValue={folderName}
                          onChange={(e) => setFolderName(e.target.value)}
                          type="text"
                        />
                        <Button
                          loading={isEditing}
                          onClick={() => handleEditFolder(folder._id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant={"icon"}
                    className="text-sm"
                    onClick={() => setDeleteFolderOpen(true)}
                  >
                    <Trash />
                  </Button>
                  <DeleteModal
                    open={deleteFolderOpen}
                    onOpenChange={setDeleteFolderOpen}
                    onConfirm={() => handleDeleteFolder(folder._id)}
                    isLoading={isDeleting}
                    title="Delete folder"
                  >
                    <h2 className="text-red-orange">Warning!</h2>
                    <p className="text-sm text-gray">
                      This is a destructive action and cannot be undone.
                    </p>
                  </DeleteModal>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleCrumbClick = (item: TFolderCrumb, index: number) => {
    setParentFolder(item.id);
    setFolderCrumb((prev) => prev.slice(0, index + 1));
  };

  const uploadPhotoElement = (
    <div className="flex h-36 flex-col items-center justify-center gap-3 pb-4">
      <div
        onClick={handleUploadClick}
        className="border-2p flex h-full w-1/4 min-w-36 flex-1 cursor-pointer flex-col items-center justify-center rounded-md border-dashed border-lavender-mist bg-background px-3"
      >
        {isUploadLoading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <LoaderCircle className="animate-spin text-3xl text-primary lg:text-3xl" />
            <p className="text-base">uploading, please wait</p>
          </div>
        ) : (
          <>
            <h3 className="text-center text-base">
              upload photos to this folder
            </h3>
            <Cloudy className="text-3xl text-lavender-mist lg:text-6xl" />
            <h3 className="text-base text-primary">Click here</h3>
            <input
              name="photos"
              onChange={handleImageUpload}
              ref={uploadImageRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
            />
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[70vw]">
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

          {folderCrumb.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {folderCrumb.map((item, index) => (
                  <BreadcrumbItem key={item.id}>
                    <BreadcrumbPage>
                      <div
                        className={`flex cursor-pointer items-center gap-1 ${item.id === parentFolder ? "text-primary" : ""}`}
                        onClick={() => handleCrumbClick(item, index)}
                      >
                        {item.name} <ChevronRight size={12} />
                      </div>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {!isFolderLoading &&
          !folderFetchError &&
          folders?.data?.length !== 0 ? (
            renderFolders(folders.data)
          ) : (
            <div
              onClick={() => setAddFolderModal(true)}
              className="flex size-32 flex-col items-center justify-center gap-2 rounded-md bg-lavender-mist"
            >
              <FolderPlus className="text-gray" size={25} />
              <p className="text-sm">Add Folder</p>
            </div>
          )}

          <div>
            {!isLoading && typeof error === "object" && (
              <div>
                <h2 className="text-center">
                  Could not get gallery images. Please try again later
                </h2>
              </div>
            )}
            {uploadPhotoElement}
            {!isLoading && !error ? (
              <div className="min-h-60 columns-1 gap-4 rounded-md sm:columns-2 md:columns-3 lg:columns-4 [&>div:not(:first-child)]:mt-4">
                {photos?.data?.map((imgData: TImage) => {
                  return (
                    <div
                      key={imgData._id}
                      className="image-wrapper group relative h-fit"
                    >
                      <Checkbox
                        checked={isSelected(imgData._id)}
                        onClick={() => handleImageSelect(imgData)}
                        className={`${
                          isSelected(imgData._id) ? "visible" : "invisible"
                        } checkbox absolute left-4 top-4 z-50 size-6 bg-lavender-mist transition-all group-hover:visible`}
                      />

                      <Image
                        onError={(err) => {
                          console.log(err);
                        }}
                        className="h-auto w-full cursor-pointer rounded-md border border-border-color"
                        src={imgData.image}
                        height={imgData.height}
                        width={imgData.width}
                        alt={imgData.name}
                      />

                      <p className="invisible absolute bottom-0 z-30 w-full break-all bg-purple-400/30 p-4 text-xs text-pure-white group-hover:visible">
                        {imgData.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div></div>
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
    </>
  );
};

export default ImageGallery;
