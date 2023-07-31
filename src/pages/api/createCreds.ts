import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { env } from "~/env.mjs";
import { firestore } from "~/utils/firestore";
const db = firestore;

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
    // doc.id = packageName
    // {
    //      l: "Login",
    //      p: "Password",
    // }
    const docRefParent = db.collection(`AppCreds`);
    const fileData = fs.readFileSync(
      `${process.cwd()}/src/pages/api/appcreds.json`,
      "utf-8"
    );
    const appCreds: RawAppCreds = JSON.parse(fileData) as RawAppCreds;

    await Promise.all(
      Object.keys(appCreds).map(async (pkgName: string) => {
        const creds = appCreds[pkgName]!;
        const doc = docRefParent.doc(pkgName);
        await doc.set({
          l: creds[0],
          p: creds[1],
        });
      })
    );

    res.status(200).json({
      data: {
        success: true,
        data: true,
      },
      error: null,
    });
  } catch (err: any) {
    console.log("Caught error: ", err);
    res.status(500).json({
      data: {
        success: false,
        data: process.cwd(),
      },
      error: `Err posting: ${String(err)}`,
    });
  }
};
export default handler;
