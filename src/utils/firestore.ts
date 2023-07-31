import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import serviceAccount from "../utils/serviceAccountKey.json";
import firebaseServiceAccount from "../utils/firebaseServiceAccount.json";
import * as firebase from "firebase-admin/app";

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
    "backend"
  );

const firestore = getFirestore(backEndApp);

const auth = getAuth(backEndApp);

export { firestore, auth, backEndApp };
