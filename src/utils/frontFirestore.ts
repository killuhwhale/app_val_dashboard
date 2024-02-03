import { initializeApp as frontInitializeApp } from "firebase/app";
import { getFirestore as getFrontFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import config from "config.json";

const provider = new GoogleAuthProvider();

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
  const [loggingIn, setLoggingIn] = useState(false);
  console.log("useFirebaseSession func: ", session.status);

  useEffect(() => {
    if (status == "authenticated") return;
    console.log("Session signInwithpop: ", session.status, !loggingIn);
    if (session && session.status === "loading" && !loggingIn) {
      console.log("setLoggingIn!!!!!!!!!!!!!!!!");
      setLoggingIn(true);
      try {
        signInWithPopup(frontEndAuth, provider)
          .then(() => {
            setStatus("authenticated");
          })
          .catch((err: any) => {
            console.log("Error firebase session", err);
          });
      } catch (err) {
        console.log("Error firebase session login", err);
      }
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
