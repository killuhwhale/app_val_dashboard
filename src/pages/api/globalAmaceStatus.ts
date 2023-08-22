import { NextApiRequest, NextApiResponse } from "next";
import { statusReasons, brokenStatusReasons } from "~/components/shared";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";

const db = firestore;

type FireStoreGlobalStatus = {
  name: string;
  packageName: string;
  status: string;
  date: Date;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);

  if (req.method === "POST") res.status(200).json({ text: "Hello post" });
  else if (req.method !== "GET")
    return res.status(404).json({ text: "Hello 404" });
  else if (
    req.headers.authorization !==
    env.NEXT_PUBLIC_FIREBASE_HOST_POST_ENDPOINT_SECRET
  )
    return res.status(403).json({ text: "Hello unauth guy" });

  try {
    const globalDocRefParent = await db.collection(`GlobalAMACEStatus`).get();

    const data: FireStoreGlobalStatus[] = [];

    globalDocRefParent.forEach((doc) => {
      const d = doc.data() as FireStoreGlobalStatus;
      d.status =
        statusReasons.get(d.status.toString()) ?? "No Status Found;API err";
      data.push(d);
    });

    res.status(200).json({
      data: data,
      error: null,
    });
  } catch (err: any) {
    console.log("Caught error: ", err);
    res.status(500).json({
      data: null,
      error: `Err posting: ${String(err)}`,
    });
  }
};
export default handler;
