import { initializeApp as frontInitializeApp } from "firebase/app";
import { getFirestore as getFrontFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signInWithCustomToken } from "firebase/auth";
import config from "config.json";

const frontEndApp = frontInitializeApp(
  config.firebaseAppInfo,
  config.frontendFirestoreName
);

const frontEndAuth = getAuth(frontEndApp);
const frontStorage = getStorage(frontEndApp);
const frontFirestore = getFrontFirestore(frontEndApp);

const useFirebaseSession = () => {
  const session = useSession();
  const [status, setStatus] = useState(session.status);

  useEffect(() => {
    if (status == "authenticated") return;

    if (session && session.status === "authenticated") {
      console.log("signInWithCustomToken", session.data.user);

      signInWithCustomToken(frontEndAuth, session.data.user.custom_token)
        .then(() => {
          setStatus("authenticated");
        })
        .catch((err: any) => {
          console.log("Error firebase session", err);
        });
    }
  }, [session]);

  useEffect(() => {
    if (session.status !== "authenticated") {
      setStatus(session.status);
    }
  }, [session.status]);

  return { data: session.data, status };
};

export { frontEndAuth, frontFirestore, frontStorage, useFirebaseSession };
