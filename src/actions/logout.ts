"use server";

import { cookies } from "next/headers";

export const clearCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("gadget_grid_refresh_token");
  cookieStore.delete("gadget_grid_access_token");
};
