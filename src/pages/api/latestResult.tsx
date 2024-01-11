import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
import CONFIG from "../../../config.json";

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);
  if (req.method === "POST") res.status(200).json({ text: "Hello post" });
  else if (req.method !== "GET")
    return res.status(404).json({ text: "Hello 404" });
  else if (req.headers.authorization !== CONFIG.AMACE_API_KEY)
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    let entry,
      id = "";
    const entries: FirebaseFirestore.DocumentData[] = [];
    const querySnapshot = await db
      .collection(`AmaceRuns`)
      .orderBy("date", "desc")
      .limit(1)
      .get();
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      entry = doc.data();
      id = doc.id;
    });

    const collectionQuerySnapshot = await db
      .collection(`AmaceRuns`)
      .doc(id)
      .collection("apps")
      .get();
    collectionQuerySnapshot.forEach((doc) => {
      entries.push(doc.data());
    });

    console.log(entries);

    res.status(200).json({
      data: {
        success: true,
        data: entries,
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
      error: `Err getting: ${String(err)}`,
    });
  }
};
export default handler;
