import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { firestore } from "~/utils/firestore";
import { env } from "~/env.mjs";

// initializeApp({
//   credential: applicationDefault(),
// });

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") res.status(200).json({ text: "Hello" });
  else if (req.method !== "POST")
    return res.status(404).json({ text: "Hello" });
  else if (
    req.headers.authorization !==
    env.NEXT_PUBLIC_FIREBASE_HOST_POST_ENDPOINT_SECRET
  )
    return res.status(403).json({ text: "Hello" });
  try {
    const body = req.body as RawAppResult;
    console.log("Incoming body: ", body);

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
    } = JSON.parse(JSON.stringify(req.body)) as RawAppResult;

    console.log(
      "Time stamps: ",
      typeof run_ts,
      run_ts,
      new Date(parseInt(run_ts.toString())),
      typeof timestamp,
      timestamp,
      new Date(parseInt(timestamp.toString()))
    );

    // 1671955200000
    // 1684523141000
    // 1684523067000
    // 1684524197878
    // 1684524271
    // 1684524733961
    const docRefParent = db.collection(`AppRuns`).doc(`${run_id}`);

    const parentRes = await docRefParent.set({
      date: new Date(parseInt(run_ts.toString())),
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
      run_ts: parseInt(run_ts.toString()),
      build,
      timestamp: parseInt(timestamp.toString()),
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
