import { initializeApp as frontInitializeApp } from "firebase/app";
import { getFirestore as getFrontFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

import { GoogleAuthProvider } from "firebase/auth";
import config from "config.json";

const provider = new GoogleAuthProvider();

const frontEndApp = frontInitializeApp(
  config.firebaseAppInfo,
  config.frontendFirestoreName
);

const frontEndAuth = getAuth(frontEndApp);
const frontStorage = getStorage(frontEndApp);
const frontFirestore = getFrontFirestore(frontEndApp);

export { frontEndAuth, frontFirestore, frontStorage };
