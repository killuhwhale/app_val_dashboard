"use client";
import { useSession } from "next-auth/react";

import { signInWithCustomToken } from "firebase/auth";
import React, { useEffect, useState } from "react";

import FullColumn from "~/components/columns/FullColumn";
import HalfColumn from "~/components/columns/HalfColumn";
import ThirdColumn from "~/components/columns/ThirdColumn";
import { api } from "~/utils/api";
import { frontEndAuth, useFirebaseSession } from "~/utils/frontFirestore";

export const formatDateToString = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

const Home: React.FC = () => {
  const sesh = useFirebaseSession();
  console.log(sesh);

  return (
    <>
      <FullColumn height="h-[85px]">
        <p className="flex h-full items-center justify-center">Row</p>
      </FullColumn>

      <HalfColumn height="h-[120px]">
        <p className="flex h-full items-center justify-center">Left</p>
        <p className="flex h-full items-center justify-center">Right</p>
      </HalfColumn>

      <ThirdColumn height="h-[120px]">
        <p className="flex h-full items-center justify-center">Left</p>
        <p className="flex h-full items-center justify-center">Middle</p>
        <p className="flex h-full items-center justify-center">Right</p>
      </ThirdColumn>
    </>
  );
};

export default Home;
