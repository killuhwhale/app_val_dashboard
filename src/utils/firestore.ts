import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import serviceAccount from "../utils/serviceAccountKey.json";
import firebaseServiceAccount from "../utils/firebaseServiceAccount.json";
import * as firebase from "firebase-admin/app";
import { backendFirestoreName } from "~/components/shared";

const backEndApp =
  firebase.getApps()[0] ??
  initializeApp(
    {
      credential: admin.credential.cert(
        firebaseServiceAccount as unknown as firebase.ServiceAccount
      ),
      projectId: serviceAccount.projectId,
      storageBucket: serviceAccount.storageBucket,
    },
    backendFirestoreName
  );

const firestore = getFirestore(backEndApp);
const backStorage = getStorage(backEndApp);
const auth = getAuth(backEndApp);

export { firestore, auth, backStorage, backEndApp };
