import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
const db = firestore;

type GlobalAppResult = {
  name: string;
  packageName: string;
  status: string;
  version: string;
  date: Date;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);
  if (req.method === "GET") res.status(200).json({ text: "Hello get" });
  else if (req.method !== "POST")
    return res.status(404).json({ text: "Hello 404" });
  else if (
    req.headers.authorization !==
    env.NEXT_PUBLIC_FIREBASE_HOST_POST_ENDPOINT_SECRET
  )
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const body = req.body as AmaceResult;
    console.log("Incoming body: ", req.body, body);

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
      loginResults,
    } = JSON.parse(JSON.stringify(req.body)) as AmaceResult;

    //Update Global list.
    console.log("New data to post: ", appType, appVersion, history, logs);
    if (status >= 60) {
      //  we need to make sure that the appversion we tested is newer than what is currently recorded before overwriting it....
      // Update Global List
      const globalDocRefParent = db
        .collection(`GlobalAMACEStatus`)
        .doc(`${pkgName}`);

      const doc = await globalDocRefParent.get();
      const parentData = doc.data() as GlobalAppResult;
      // If recorded version is older than the verison just tested, update...
      if (parentData !== undefined) {
        if (
          parentData.version == undefined ||
          parentData.version < appVersion
        ) {
          const globalDocRefParentRes = await globalDocRefParent.set({
            name: appName,
            packageName: pkgName,
            status: status,
            version: appVersion,
            date: new Date(),
          });
        }
      }
    }

    //  Update Run results
    const docRefParent = db.collection(`AmaceRuns`).doc(`${runID}`);

    const parentRes = await docRefParent.set({
      date: new Date(parseInt(runTS.toString())),
    });

    const docRefSub = docRefParent
      .collection(`apps`)
      .doc(`${pkgName}|${buildInfo}`);

    const docRes = await docRefSub.set({
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
      loginResults,
    });

    console.log("Doc res", docRes);

    res.status(200).json({
      data: {
        success: true,
        data: {
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
          loginResults,
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
