import { NextApiRequest, NextApiResponse } from "next";
import { processStats } from "~/utils/chartUtils";
import { firestore } from "~/utils/firestore";
import { isValidGetRequest } from "./utils";

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!isValidGetRequest(req)) {
    return res.status(403).json({ text: "Invalid get request" });
  }
  // if (req.method === "POST") res.status(200).json({ text: "Hello post" });
  // else if (req.method !== "GET")
  //   return res.status(404).json({ text: "Hello 404" });
  // else if (req.headers.authorization !== CONFIG.AMACE_API_KEY)
  //   return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const runID = req.query["runID"] as string;

    const apps = await db
      .collection(`AmaceRuns`)
      .doc(runID)
      .collection(`apps`)
      .get();
    const results: AmaceDBResult[] = [];

    for (let i = 0; i < apps.docs.length; i++) {
      const app = apps.docs[i];
      if (app) results.push(app.data() as AmaceDBResult);
    }

    const stats = processStats(results);

    res.status(200).json({
      data: {
        success: true,
        stats,
        results,
      },
      error: null,
    });
  } catch (err: any) {
    console.log("Caught error amaceRunByID: ", err);
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
