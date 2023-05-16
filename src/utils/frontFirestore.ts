import { initializeApp as frontInitializeApp } from "firebase/app";
import { getFirestore as getFrontFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signInWithCustomToken } from "firebase/auth";

const frontEndApp = frontInitializeApp(
  {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  "frontend"
);
const frontEndAuth = getAuth(frontEndApp);
const frontFirestore = getFrontFirestore(frontEndApp);

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

export { frontEndAuth, frontFirestore, useFirebaseSession };
