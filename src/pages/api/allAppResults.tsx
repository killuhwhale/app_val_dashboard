import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
import CONFIG from "../../../config.json";
const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);
  if (req.method === "GET") res.status(200).json({ text: "Hello get" });
  else if (req.method !== "POST")
    return res.status(404).json({ text: "Hello 404" });
  else if (req.headers.authorization !== CONFIG.AMACE_API_KEY)
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const body = req.body as AllApps;
    console.log("Incoming body: ", req.body, body.data);
    console.log("first data", body.data[0]);
    console.log("size", req.socket.bytesRead);

    console.log(body.data.length);
    for (let i = 0; i < body.data.length; i++) {
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
      } = JSON.parse(JSON.stringify(body.data[i])) as AmaceResult;

      // Get the device name
      const device = deviceInfo.split(" - ")[0];
      console.log("Device name", device);
      console.log("Device info", deviceInfo);
      // Update App results
      const appResultParentRef = db.collection(`AppResults`).doc(`${pkgName}`);
      await appResultParentRef.set({});

      const appResultSubRef = appResultParentRef
        .collection(`${device || ""}`)
        .doc(`${runID}`);
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
      console.log(i);
    }

    console.log("Finished writing");
    res.status(200).json({
      data: {
        success: true,
        error: null,
      },
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
