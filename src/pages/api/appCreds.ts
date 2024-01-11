import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
import CONFIG from "../../../config.json";

const db = firestore;

type AppCredDoc = {
  l: string; // Login
  p: string; // Password
};

type AppCreds = {
  [key: string]: AppCredDoc;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);

  if (req.method === "POST") res.status(200).json({ text: "Hello post" });
  else if (req.method !== "GET")
    return res.status(404).json({ text: "Hello 404" });
  else if (req.headers.authorization !== CONFIG.AMACE_API_KEY)
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const docRefParent = db.collection(`AppCreds`);
    const appDocs = await docRefParent.get();
    const results = {} as AppCreds;
    let docData = null;
    appDocs.forEach((doc) => {
      docData = doc.data() as AppCredDoc;
      results[doc.id] = { l: docData.l, p: docData.p };
    });

    console.log("Results: ", results);

    res.status(200).json({
      data: {
        success: true,
        data: results,
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
