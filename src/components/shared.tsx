const statusReasons = new Map<string, string>();
const brokenStatusReasons = new Map<string, string>();

// Display String based on status
statusReasons.set("0", "Fail");
statusReasons.set("1", "Launch Fail");
statusReasons.set("2", "Crashed");
statusReasons.set("10", "Needs purchase");
statusReasons.set("20", "App is old");
statusReasons.set("30", "Failed to install");
statusReasons.set("31", "Too many attempts");
statusReasons.set("40", "Device not compatible");
statusReasons.set("41", "Chromebook not compatible");
statusReasons.set("50", "Country NA");
statusReasons.set("60", "O4C");
statusReasons.set("70", "O4C FS only");
statusReasons.set("80", "FS -> Amace");
statusReasons.set("90", "Phone only");
statusReasons.set("100", "Tablet only");
statusReasons.set("110", "Amace");
statusReasons.set("120", "PWA");

brokenStatusReasons.set("0", "LoggedinGoogle");
brokenStatusReasons.set("10", "LoggedinFacebook");
brokenStatusReasons.set("20", "LoggedinEmail");
brokenStatusReasons.set("30", "Pass");
brokenStatusReasons.set("40", "WinDeath");
brokenStatusReasons.set("50", "ForceRemoved");
brokenStatusReasons.set("60", "FDebugCrash");
brokenStatusReasons.set("70", "FatalException");
brokenStatusReasons.set("80", "ProceDied");
brokenStatusReasons.set("90", "ANR");
brokenStatusReasons.set("100", "Failed");
brokenStatusReasons.set("101", "FailedInstall");
brokenStatusReasons.set("102", "FailedLaunch");
brokenStatusReasons.set("103", "FailedAmaceCheck");

// When updating GCP project these need new names.
const frontendFirestoreName = "frontendv2";
const backendFirestoreName = "backendv2";

const wssURL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:3001/wss"
    : "wss://appvaldashboard.com/wss";

export {
  statusReasons,
  brokenStatusReasons,
  wssURL,
  frontendFirestoreName,
  backendFirestoreName,
};
