import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";

// initializeApp({
//   credential: applicationDefault(),
// });

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);
  if (req.method === "GET") res.status(200).json({ text: "Hello get" });
  else if (req.method !== "POST")
    return res.status(404).json({ text: "Hello 404" });
  else if (
    req.headers.authorization !==
    env.NEXT_PUBLIC_FIREBASE_HOST_POST_ENDPOINT_SECRET
  )
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const body = req.body as AmaceResult;
    console.log("Incoming body: ", req.body, body);

    const {
      appName,
      appTS,
      status,
      brokenStatus,
      pkgName,
      runID,
      runTS,
      buildInfo,
      deviceInfo,
      appType,
      appVersion,
      history,
      logs,
    } = JSON.parse(JSON.stringify(req.body)) as AmaceResult;

    console.log("New data to post: ", appType, appVersion, history, logs);

    // Get the device name
    const device = deviceInfo.split(" - ")[0];
    console.log("Device name", device);
    console.log("Device info", deviceInfo);
    // Update App results
    const appResultDocRefParent = db.collection(`AppResults`).doc(`${pkgName}`);

    /*const appResultParentRes = await appResultDocRefParent.set({
      date: new Date(parseInt(runTS.toString())),
    });

    console.log("App result", appResultParentRes);*/

    const appResultSubRef = appResultDocRefParent.collection(`${device || ''}`).doc(`${runID}`);

    const appResultRes = await appResultSubRef.set({
      appName,
      pkgName,
      runID,
      runTS: parseInt(runTS.toString()),
      appTS: parseInt(appTS.toString()),
      status,
      brokenStatus,
      buildInfo,
      deviceInfo,
      appType,
      appVersion,
      history: JSON.stringify(history),
      logs,
    });

    console.log("Doc res", appResultRes);

    res.status(200).json({
      data: {
        success: true,
        data: {
          appName,
          appTS,
          status,
          brokenStatus,
          pkgName,
          runID,
          runTS,
          buildInfo,
          deviceInfo,
          appType,
          appVersion,
          history,
          logs,
        },
      },
      error: null,
    });

  } catch (err: any) {
    console.log("Caught error: ", err);
    res.status(500).json({
      data: {
        success: false,
        data: null,
      },
      error: `Err posting: ${String(err)}`,
    });
  }
};
export default handler;
