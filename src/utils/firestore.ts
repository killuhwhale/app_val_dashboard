import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import config from "config.json";
import * as firebase from "firebase-admin/app";
const backEndApp =
  firebase.getApps()[0] ??
  initializeApp(
    {
      credential: admin.credential.cert(
        config.firebaseServiceAccount as firebase.ServiceAccount
      ),
      projectId: config.PROJECT_INFO.projectId,
      storageBucket: config.PROJECT_INFO.storageBucket,
    },
    config.backendFirestoreName
  );

const firestore = getFirestore(backEndApp);
const backStorage = getStorage(backEndApp);
const auth = getAuth(backEndApp);

export { firestore, auth, backStorage, backEndApp };
