import { NextApiRequest, NextApiResponse } from "next";
import { MONTHS, compareStrings } from "~/components/shared";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
import CONFIG from "../../../config.json";

const db = firestore;

type GlobalAppResult = {
  name: string;
  packageName: string;
  status: string;
  version: string;
  date: Date;
};

/**  Endpoint to post a single app run.
 *
 *
 * Updates FireStore Collections:
 *    GlobalAMACEStatus - deprecated
 *      - Updates list of latest app results provided as an endpoint.
 *    AppResults
 *      - @ecox using to process latest runs to enable effiecient runs in the future
 *    AmaceRuns
 *      - Main results for ea runID shown in table on the dashboard
 *
 */

const today = new Date();
const year = today.getFullYear();
const month = MONTHS[today.getMonth()]!;

/**
 * AppResults
 *   -  using to process latest runs to enable effiecient runs in the future
 */
async function handleAppResults(result: AmaceResult) {
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
  } = result;

  // Get the device name
  const device = deviceInfo.split(" - ")[0];
  // Update App results
  const appResultParentRef = db.collection(`AppResults`).doc(`${pkgName}`);
  await appResultParentRef.set({});

  const appResultSubRef = appResultParentRef
    .collection(`${device || ""}`)
    .doc(`${runID}`);

  return await appResultSubRef.set({
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
}

/**
 * AmaceRuns
 *   - Main results for ea runID shown in table on the dashboard
 */
async function handleRunResults(result: AmaceResult) {
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
  } = result;
  //  Update Run results
  const docRefParent = db.collection(`AmaceRuns`).doc(`${runID}`);

  await docRefParent.set({
    date: new Date(parseInt(runTS.toString())),
  });

  return await docRefParent
    .collection(`apps`)
    .doc(`${pkgName}|${buildInfo}`)
    .set({
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
}

/**
 *  testedOndevices - key to identify which device the app was tested on.
 *
 */
function deviceBuildkey(result: AmaceResult | TestedHistoryStep) {
  const deviceName = result.deviceInfo.split("-")[0]!; // helios
  const buildNamePieces = result.buildInfo.split("-"); // helios
  const buildName = buildNamePieces.slice(0, 2).join(" ");
  return `${deviceName}${buildName}|`;
}

// Given AmaceResult, create a snapshot of the history
const makeTestHistory = (amaceResult: AmaceResult) => {
  return {
    testedOndevice: deviceBuildkey(amaceResult),
    runID: amaceResult.runID,
    runTS: amaceResult.runTS,
    appTS: amaceResult.appTS,
    buildInfo: amaceResult.buildInfo,
    deviceInfo: amaceResult.deviceInfo,
    appVersion: amaceResult.appVersion,
    status: amaceResult.status,
    brokenStatus: amaceResult.brokenStatus,
    logs: amaceResult.logs,
    loginResults: amaceResult.loginResults,
    history: JSON.stringify(amaceResult.history),
  } as TestedHistoryStep;
};

/**
 *
 * Updates broken app result if app has already been tested.
 *  We wil update fields to reflect the devices the app was tested on and its reported failures.
 *
 */
async function updateBrokenResult(
  result: AmaceResult,
  docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
) {
  // If we havea  document that exists, that means we have tested this app this month already and its broken.
  // we only need to update this entry to add the version tested if its newer, or if we tested on a newer device build.
  const dbData = (await docRef.get()).data() as BrokenAppDBResult;

  // Check if app version and testedOnDevices are already stored, if so this is a repaet and we can move on....
  let isDuplicate = false;
  const testedHist = JSON.parse(dbData.testedHistory) as TestedHistoryStep[];
  testedHist.forEach((tHist: TestedHistoryStep) => {
    const key = `${result.appVersion}${deviceBuildkey(result)}`;
    const curItemKey = `${tHist.appVersion}${deviceBuildkey(tHist)}`;
    if (key === curItemKey) isDuplicate = true;
  });

  if (isDuplicate) {
    const histStep = makeTestHistory(result);
    const prevSteps = JSON.parse(dbData.testedHistory) as TestedHistoryStep[];
    let combinedSteps = [] as TestedHistoryStep[];
    if (prevSteps.length > 0) {
      combinedSteps = [...prevSteps, histStep];
    } else {
      combinedSteps = [histStep];
    }

    await docRef.update({
      testedHistory: JSON.stringify(combinedSteps),
    });
  } else {
    console.log(
      `Broken app is a duplicate, we have already tested this app version(${
        result.appVersion
      }) on this device(${deviceBuildkey(result)})`
    );
  }
}

async function handleBrokenResults(result: AmaceResult) {
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
  } = result;

  const monthlyDocRef = db.collection(`BrokenApps`).doc(`${year} ${month}`);

  const monthlyDoc = await monthlyDocRef.get();

  if (!monthlyDoc.exists) {
    await monthlyDocRef.set({
      date: new Date(`${month}-01-${year}`),
    });
  }

  const pkgNameDocRef = monthlyDocRef.collection("apps").doc(pkgName);

  const pkgNameDoc = await pkgNameDocRef.get();
  console.log("handling broken result, exists: ", pkgNameDoc.exists);

  if (pkgNameDoc.exists) return await updateBrokenResult(result, pkgNameDocRef);
  else {
    const appData = {
      appName,
      pkgName,
      appType,
      testedHistory: JSON.stringify([makeTestHistory(result)]),
    } as BrokenAppDBResult;

    return await pkgNameDocRef.set(appData);
  }
}

async function handleTop250Results(result: AmaceResult) {
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
  } = result;

  const monthlyDocRef = db.collection(`Top250`).doc(`${year} ${month}`);

  const monthlyDoc = await monthlyDocRef.get();

  if (!monthlyDoc.exists) {
    await monthlyDocRef.set({
      date: new Date(`${month}-01-${year}`),
    });
  }

  const pkgNameDocRef = monthlyDocRef.collection("apps").doc(pkgName);

  const pkgNameDoc = await pkgNameDocRef.get();
  console.log("handling Top 250 broken result, exists: ", pkgNameDoc.exists);

  if (pkgNameDoc.exists) return await updateBrokenResult(result, pkgNameDocRef);
  else {
    console.log("Creating new handleTop250Results: ");
    const appData = {
      appName,
      pkgName,
      appType,
      testedHistory: JSON.stringify([makeTestHistory(result)]),
    } as BrokenAppDBResult;

    return await pkgNameDocRef.set(appData);
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);
  if (req.method === "GET") res.status(200).json({ text: "Hello get" });
  else if (req.method !== "POST")
    return res.status(404).json({ text: "Hello 404" });
  else if (req.headers.authorization !== CONFIG.AMACE_API_KEY)
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const body = req.body as AmaceResult;
    console.log("Incoming body: ", body);
    const amaceResult = JSON.parse(JSON.stringify(req.body)) as AmaceResult;

    await handleAppResults(amaceResult);
    await handleRunResults(amaceResult);

    if (
      amaceResult.brokenStatus >= 40 &&
      amaceResult.dSrcPath === "AppLists/Top 250"
    ) {
      console.log("handleTop250Results: ");
      await handleTop250Results(amaceResult);
    } else if (amaceResult.brokenStatus >= 40)
      await handleBrokenResults(amaceResult);

    res.status(200).json({
      data: {
        success: true,
        data: amaceResult,
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
