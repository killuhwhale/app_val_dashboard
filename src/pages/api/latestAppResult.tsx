import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
import CONFIG from "../../../config.json";

type AppRequest = {
  pkgName: string;
  deviceInfo: string;
};

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
    console.log("latestAppResult");
    const body = req.body as AppRequest;
    console.log("Incoming body: ", req.body, body);

    const { pkgName, deviceInfo } = JSON.parse(
      JSON.stringify(req.body)
    ) as AppRequest;

    // Get the device name
    const device = deviceInfo.split(" - ")[0];
    console.log("Device name", device);
    console.log("Device info", deviceInfo);

    // Get latest app result on device
    let entry,
      id = "";
    const querySnapshot = await db
      .collection(`AppResults`)
      .doc(`${pkgName}`)
      .collection(`${device || ""}`)
      .orderBy("runTS", "desc")
      .limit(1)
      .get();
    const snapshotResult = querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      entry = doc.data();
      id = doc.id;
    });

    console.log("Entry result", entry);

    res.status(200).json({
      data: {
        success: true,
        data: entry,
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
