import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { firestore } from "~/utils/firestore";
import { isValidPostReq } from "./utils";

const db = firestore;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.method);
  console.log(req.headers["content-type"]);
  if (!isValidPostReq(req))
    return res.status(403).json({ text: "Invalid post request" });

  try {
    // doc.id = packageName
    // {
    //      l: "Login",
    //      p: "Password",
    // }
    const docRefParent = db.collection(`AppCreds`);
    const fileData = fs.readFileSync(`${process.cwd()}/appcreds.json`, "utf-8");
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
    console.log("Caught error createCreds: ", err);
    res.status(500).json({
      data: {
        success: false,
        data: process.cwd(),
      },
      error: `Err: ${String(err)}`,
    });
  }
};
export default handler;
