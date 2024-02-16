import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "~/utils/firestore";
import { isValidGetRequest } from "./utils";

type AppRequest = {
  pkgName: string;
  deviceInfo: string;
};

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);
  if (!isValidGetRequest(req))
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const { pkgName, deviceInfo } = JSON.parse(
      JSON.stringify(req.body)
    ) as AppRequest;

    // Get the device name
    const device = deviceInfo.split(" - ")[0];

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

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      entry = doc.data();
      id = doc.id;
    });

    res.status(200).json({
      data: {
        success: true,
        data: entry,
      },
      error: null,
    });
  } catch (err: any) {
    console.log("Caught error latestAppResult: ", err);
    res.status(500).json({
      data: {
        success: false,
        data: null,
      },
      error: `Err: ${String(err)}`,
    });
  }
};
export default handler;
