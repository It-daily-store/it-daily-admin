"use client";

import { useAppSelector } from "@/redux/hooks";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import ImageGallery from "../product/ImageGallery";
import NotificationMenu from "../notifications/NotificationMenu";
import { CircleUserRound, Images, Moon, Settings, Sun } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import GlobalDropdown from "../common/GlobalDropdown";

const Navbar = () => {
  const [loaded, setLoaded] = useState(false);
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50">
      <div className="py-2 flex gap-2 justify-between items-center border-border-color bg-sidebar border-b">
        <SidebarTrigger className="md:hidden" />
        <div className="flex w-full justify-end items-center gap-2">
          <Button
            variant={"secondary"}
            onClick={() => setGalleryOpen(true)}
            className="gap-1 h-8 text-sm"
          >
            <Images size={18} /> Gallery
          </Button>

          <NotificationMenu />

          {isAuthenticated && (
            <div className="flex justify-end items-center gap-2">
              <GlobalDropdown
                dropdownRender={
                  <>
                    <Link
                      href={"/my-profile"}
                      className="flex items-center gap-3"
                    >
                      <CircleUserRound size={18} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href={"/settings"}
                      className="flex items-center gap-3"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                  </>
                }
                title={
                  <Button variant="icon" size={"base"}>
                    <Avatar>
                      <AvatarImage src={user?.profilePicture} />
                      <AvatarFallback className="capitalize">
                        {user?.name && (
                          <>
                            {user?.name?.firstName?.slice(0, 1)}
                            {user?.name?.lastName?.slice(0, 1)}
                          </>
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              >
                <Button variant="icon" size={"base"}>
                  <Avatar className="size-8">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="capitalize">
                      {user?.fullName?.slice(0, 1)}
                      {user?.fullName?.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </GlobalDropdown>

              {loaded && (
                <div className="mx-auto h-8 flex items-center justify-center rounded-full border border-border-color bg-lavender-mist font-semibold shadow-lg">
                  <button
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className={`flex size-8 justify-center items-center rounded-full text-black ${
                      theme === "light" ? "" : "bg-primary text-pure-white"
                    }`}
                  >
                    <Moon />
                  </button>
                  <button
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    className={`flex h-full items-center justify-center rounded-full size-8 text-black ${
                      theme === "light" ? "bg-primary text-pure-white" : ""
                    }`}
                  >
                    <Sun size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <ImageGallery open={galleryOpen} setOpen={setGalleryOpen} />
      </div>
    </nav>
  );
};

export default Navbar;
