const status_reasons = new Map<string, string>();
const brokenStatus_reasons = new Map<string, string>();

// Display String based on status
status_reasons.set("0", "Fail");
status_reasons.set("1", "Launch Fail");
status_reasons.set("2", "Crashed");
status_reasons.set("10", "Needs purchase");
status_reasons.set("20", "App is old");
status_reasons.set("30", "Failed to install");
status_reasons.set("40", "Device not compatible");
status_reasons.set("50", "Country NA");
status_reasons.set("60", "O4C");
status_reasons.set("70", "O4C FS only");
status_reasons.set("80", "FS -> Amace");
status_reasons.set("90", "Phone only");
status_reasons.set("100", "Tablet only");
status_reasons.set("110", "Amace");
status_reasons.set("120", "PWA");

brokenStatus_reasons.set("0", "LoggedinGoogle");
brokenStatus_reasons.set("10", "LoggedinFacebook");
brokenStatus_reasons.set("20", "LoggedinEmail");
brokenStatus_reasons.set("30", "Pass");
brokenStatus_reasons.set("40", "WinDeath");
brokenStatus_reasons.set("50", "ForceRemoved");
brokenStatus_reasons.set("60", "FDebugCrash");
brokenStatus_reasons.set("70", "FatalException");
brokenStatus_reasons.set("80", "ProceDied");
brokenStatus_reasons.set("90", "ANR");
brokenStatus_reasons.set("100", "Failed");
brokenStatus_reasons.set("101", "FailedInstall");
brokenStatus_reasons.set("102", "FailedLaunch");
brokenStatus_reasons.set("103", "FailedAmaceCheck");

export { status_reasons, brokenStatus_reasons };
