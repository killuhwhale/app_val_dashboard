import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
import CONFIG from "../../../config.json";

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("applist: ", req.method);
  console.log(req.headers["content-type"]);

  if (req.method === "POST") res.status(200).json({ text: "Hello post" });
  else if (req.method !== "GET")
    return res.status(404).json({ text: "Hello 404" });
  else if (req.headers.authorization !== CONFIG.AMACE_API_KEY)
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const dsrctype = req.query["dsrctype"];
    const dsrcpath: string[] = (req.query["dsrcpath"] as string)?.split("/");
    if (dsrcpath.length !== 2) {
      const err = "Error, path should be a '/' separated string";
      console.log(err);
      return res.status(200).json({
        data: null,
        error: err,
      });
    }

    console.log("dsrctype, dsrcpath: ", dsrctype, dsrcpath);

    const docRefParent = db.collection(dsrcpath[0]!).doc(dsrcpath[1]!);
    const result = await docRefParent.get();

    const data = result.data()!["apps"] as string;
    let driveURL = "";
    if (dsrctype == "pythonstore") {
      driveURL = result.data()!["driveURL"] as string;
    }

    console.log("Apps: ", result.data());

    res.status(200).json({
      data: {
        success: true,
        data,
        driveURL,
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
