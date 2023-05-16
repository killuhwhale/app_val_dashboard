"use client";
import { useSession } from "next-auth/react";

import { signInWithCustomToken } from "firebase/auth";
import React, { useEffect, useState } from "react";

import FullColumn from "~/components/columns/FullColumn";
import HalfColumn from "~/components/columns/HalfColumn";
import ThirdColumn from "~/components/columns/ThirdColumn";
import { api } from "~/utils/api";
import { frontEndAuth } from "~/utils/frontFirestore";

const useFirebaseSession = () => {
  const session = useSession();
  const [status, setStatus] = useState(session.status);

  useEffect(() => {
    if (status == "authenticated") return;

    if (session && session.status === "authenticated") {
      // signInWithCredential(auth, )  TODO() Setup Firebase/Auth for lcient side?
      console.log("signInWithCustomToken", session.data.user);

      signInWithCustomToken(frontEndAuth, session.data.user.custom_token).then(
        () => {
          setStatus("authenticated");
        }
      );
    }
  }, [session]);

  useEffect(() => {
    if (session.status !== "authenticated") {
      setStatus(session.status);
    }
  }, [session.status]);

  return { data: session.data, status };
};

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
