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

    const docRefParent = db.collection(`AmaceRuns`).doc(`${runID}`);

    const parentRes = await docRefParent.set({
      date: new Date(parseInt(runTS.toString())),
    });

    const docRefSub = docRefParent
      .collection(`apps`)
      .doc(`${pkgName}|${buildInfo}`);

    const docRes = await docRefSub.set({
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

    console.log("Doc res", docRes);

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
