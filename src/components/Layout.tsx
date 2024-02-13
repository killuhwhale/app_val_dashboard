"use client";
import { NextPage } from "next";
import Header from "./Header";
import NavMenu from "./NavMenu";
import exp from "constants";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const PageLayout: NextPage<{ children: ReactNode }> = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("/api/auth/signin");
    }
  });

  return (
    <div className=" min-h-screen w-full bg-gradient-to-b from-slate-600 to-sky-900">
      <Header />
      <NavMenu />
      <div className="p-4 sm:ml-48">
        <div className="mt-14 rounded-tl-lg border-l border-t border-dashed border-gray-200 p-4 dark:border-gray-400">
          {status === "authenticated" ? children : <p>Need to login</p>}
        </div>
      </div>
    </div>
  );
};
export default PageLayout;
