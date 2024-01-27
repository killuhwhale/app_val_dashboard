import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import config from "config.json";
import * as firebase from "firebase-admin/app";
import * as fs from "fs";

// const adc = JSON.parse(fs.readFileSync(config.ADC, "utf-8").toString());

// const refreshToken = adc["refresh_token"];

// console.log("Found refresh token: ", adc, refreshToken);

const backEndApp =
  firebase.getApps()[0] ??
  initializeApp(
    {
      // credential: admin.credential.cert(
      //   config.firebaseServiceAccount as firebase.ServiceAccount
      // ),
      // credential: admin.credential.cert(adc as firebase.ServiceAccount),
      // credential: admin.credential.refreshToken(adc),
      credential: admin.credential.applicationDefault(),

      projectId: config.PROJECT_INFO.projectId,
      storageBucket: config.PROJECT_INFO.storageBucket,
    },
    config.backendFirestoreName
  );

const firestore = getFirestore(backEndApp);
const backStorage = getStorage(backEndApp);
const auth = getAuth(backEndApp);

export { firestore, auth, backStorage, backEndApp };
