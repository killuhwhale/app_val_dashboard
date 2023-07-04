type FirebaseDate = {
  seconds: number;
  nanoseconds: number;
};

type AppRun = {
  date: FirebaseDate;
};

type AppResult = {
  status: string;
  package_name: string;
  name: string;
  app_type: string;
  app_version: string;
  report_title: string;
  run_id: string;
  run_ts: FirebaseDate;
  build: string;
  timestamp: FirebaseDate;
  history: string;
  logs: string;
};

type RawAppResult = {
  status: string;
  package_name: string;
  name: string;
  app_type: string;
  app_version: string;
  report_title: string;
  run_id: string;
  run_ts: number;
  build: string;
  timestamp: number;
  history: string;
  logs: string;
  addr: string;
};

interface AppResultRowProps {
  appResult: RawAppResult;
  decoratedPackageName?: string;

  setShowHistory(show: boolean): void;
  setShowLogs(show: boolean): void;
  onSelectHistory(text: string): void;
  onSelectLogs(text: string): void;
  onSelectAppName(text: string): void;
}

type BarLineChartDataPoint = {
  name: string;
  uv: number;
};

interface BarChartPassFailTotalsProps {
  data: BarLineChartDataPoint[];
}

type AppStatus = {
  PLAYSTORE_FAIL: number; // Playstore crashed -13
  CRASH_WIN_DEATH: number; // App crashed on launch -12
  CRASH_FORCE_RM_ACT_RECORD: number; // App crashed on launch -11
  CRASH_ANR: number; // App crashed on launch -10
  CRASH_FDEBUG_CRASH: number; // App crashed on launch -9
  CRASH_FATAL_EXCEPTION: number; // App crashed on launch -8
  FAILED_TO_LAUNCH: number; // Fail to launch - should also capture logs for this. -7
  FAILED_TO_INSTALL: number; // Genral install error -6
  NEEDS_PRICE: number; // App needs to be purchased -5
  DEVICE_NONCOMPAT: number; // Device missing feature -4
  INVALID: number; // App not on playstore anymore -3
  APP_OLD: number; // App targets old SDK -2
  COUNTRY_NA: number; // Country NA -1
  FAIL: number; // General failure with testing  0
  PASS: number; // App launched w/out errors detected.  1
  LOGGED_IN_GOOGLE: number; // Logged in via google account  2
  LOGGED_IN_FB: number; // Logged in via facebook account  3
  LOGGED_IN_EMAIL: number; // Logged in via email/password  4
  INIT: number; //  1337
};

// From firebase to UI
type AmaceDBResult = {
  appName: string;
  pkgName: string;
  runID: string;
  runTS: number;
  appTS: number;
  status: number;
  brokenStatus: number;
  buildInfo: string;
  deviceInfo: string;
  appType: string;
  appVersion: string;
  history: string;
  logs: string;
};

enum AppType {
  APP = "App",
  Game = "Game",
  PWA = "PWA",
}

type HistoryStep = {
  msg: string;
  url: string;
};

// From client program into API/DB
type AmaceResult = {
  appName: string;
  pkgName: string;
  runID: string;
  runTS: string;
  appTS: string;
  status: number;
  brokenStatus: number;
  buildInfo: string;
  deviceInfo: string;
  appType: AppType;
  appVersion: string;
  history: HistoryStep[];
  logs: string;
};

// From client, not used. Just a reference.
// const AmaceStatus = new Map<number, string>();
// AmaceStatus.set(0, "Fail");
// AmaceStatus.set(1, "PRICE");
// AmaceStatus.set(2, "OLDVERSION");
// AmaceStatus.set(3, "INSTALLFAIL");
// AmaceStatus.set(4, "COUNTRYNA");
// AmaceStatus.set(5, "O4C");
// AmaceStatus.set(6, "O4CFullScreenOnly");
// AmaceStatus.set(7, "IsFSToAmacE");
// AmaceStatus.set(8, "IsLockedPAmacE");
// AmaceStatus.set(9, "IsLockedTAmacE");
// AmaceStatus.set(10, "IsAmacE");
