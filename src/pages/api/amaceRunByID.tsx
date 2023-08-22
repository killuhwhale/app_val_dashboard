import { NextApiRequest, NextApiResponse } from "next";
import { genChartTotalsText } from "~/components/charts/BarChartPassFailTotals";
import { env } from "~/env.mjs";
import { processStats } from "~/utils/chartUtils";
import { firestore } from "~/utils/firestore";
import { getToken } from "next-auth/jwt";

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
  const secret = env.NEXTAUTH_SECRET;
  const t = await getToken({ req });
  console.log("Looking up token: ", t);

  if (req.method === "POST") res.status(200).json({ text: "Hello post" });
  else if (req.method !== "GET")
    return res.status(404).json({ text: "Hello 404" });
  else if (
    req.headers.authorization !==
    env.NEXT_PUBLIC_FIREBASE_HOST_POST_ENDPOINT_SECRET
  )
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    //  Update Run results
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
    //stats =  [{
    //   name: "Failedtoinstall",
    //   uv: reasons.Failedtoinstall,
    // },]

    res.status(200).json({
      data: {
        success: true,
        stats,
        results,
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
