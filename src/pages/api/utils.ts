import { NextApiRequest } from "next";
import CONFIG from "../../../config.json";

export function isValidGetRequest(req: NextApiRequest) {
  return (
    req.method === "GET" && req.headers.authorization === CONFIG.AMACE_API_KEY
  );
}

export function isValidPostReq(req: NextApiRequest) {
  return (
    req.method === "POST" && req.headers.authorization === CONFIG.AMACE_API_KEY
  );
}
