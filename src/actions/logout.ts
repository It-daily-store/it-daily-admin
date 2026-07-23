"use server";

import { cookies } from "next/headers";

export const clearCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("refreshToken");
};
