import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "~/utils/firestore";
import { isValidGetRequest, isValidPostReq } from "./utils";

const db = firestore;

type AppCredDoc = {
  l: string; // Login
  p: string; // Password
};

type AppCreds = {
  [key: string]: AppCredDoc;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!isValidGetRequest(req))
    return res.status(403).json({ text: "Invalid get request" });

  try {
    const docRefParent = db.collection(`AppCreds`);
    const appDocs = await docRefParent.get();
    const results = {} as AppCreds;
    let docData = null;
    appDocs.forEach((doc) => {
      docData = doc.data() as AppCredDoc;
      results[doc.id] = { l: docData.l, p: docData.p };
    });

    res.status(200).json({
      data: {
        success: true,
        data: results,
      },
      error: null,
    });
  } catch (err: any) {
    console.log("Caught error appCreds: ", err);
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
