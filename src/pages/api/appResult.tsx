import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { firestore } from "~/utils/firestore";

// initializeApp({
//   credential: applicationDefault(),
// });

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") res.status(200).json({ text: "Hello" });
  else if (req.method !== "POST") return;
  try {
    const body: string = req.body as string;
    const {
      status,
      package_name,
      name,
      report_title,
      run_id,
      run_ts, // run_ts
      build,
      timestamp,
      reason,
      new_name,
      invalid,
      history,
      logs,
    } = JSON.parse(body) as RawAppResult;
    const docRefParent = db.collection(`AppRuns`).doc(`${run_id}`);

    const parentRes = await docRefParent.set({
      date: new Date(run_ts),
    });

    const docRefSub = docRefParent
      .collection(`apps`)
      .doc(`${package_name}|${report_title}`);

    const docRes = await docRefSub.set({
      status,
      package_name,
      name,
      report_title,
      run_id,
      run_ts: new Date(run_ts),
      build,
      timestamp: new Date(timestamp),
      reason,
      new_name,
      invalid,
      history,
      logs,
    });

    console.log("Doc res", docRes);

    // const ex =  {
    //     status: 0,
    //     package_name: 'com.netflix.test',
    //     name: 'Netflix',
    //     report_title: 'helios_192.168.0.123',
    //     timestamp: 'Monday, May 08, 2023 11:34:41 PM',
    //     reason: 'App failed to open',
    //     new_name: '',
    //     invalid: '',
    //     history: "[{'msg': 'Failed: Click install button :: Needs purchase.', 'img': '/home/killuh/ws_p38/appium/src/images/history/192.168.1.113:5555/com.mojang.minecraftpe/0.png'}]",
    //     logs: '',
    // }
    /**
     *
     status,
    package_name,
    name,
    report_title,
    timestamp,
    reason,
    new_name,
    invalid,
    history,
    logs,
     *
     */
    res.status(200).json({
      data: {
        success: true,
        data: {
          status,
          package_name,
          name,
          report_title,
          timestamp,
          reason,
          new_name,
          invalid,
          history,
          logs,
        },
      },
      error: null,
    });
  } catch (err: any) {
    console.log(err);
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
