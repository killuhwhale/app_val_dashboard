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
  report_title: string;
  run_id: string;
  run_ts: FirebaseDate;
  build: string;
  timestamp: FirebaseDate;
  reason: string;
  new_name: string;
  invalid: string;
  history: string;
  logs: string;
};

type RawAppResult = {
  status: string;
  package_name: string;
  name: string;
  report_title: string;
  run_id: string;
  run_ts: number;
  build: string;
  timestamp: number;
  reason: string;
  new_name: string;
  invalid: string;
  history: string;
  logs: string;
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
  LOGGED_IN_FACEBOOK: number;
  LOGGED_IN_GOOLE: number;
  LOGGED_IN_EMAIL: number;
  PASS: number;
  FAIL: number;
  CRASH_WIN_DEATH: number;
  CRASH_FORCE_RM_ACT_RECORD: number;
  CRASH_ANR: number;
  CRASH_FDEBUG_CRASH: number;
  CRASH_FATAL_EXCEPTION: number;
  NEEDS_PRICE: number;
  INVALID: number;
  DID_NOT_OPEN: number;
};

// From firebase to UI
type AmaceDBResult = {
  appName: string;
  pkgName: string;
  runID: string;
  runTS: number;
  appTS: number;
  status: number;
  buildInfo: string;
  deviceInfo: string;
  isGame: boolean;
};

// From client program into API/DB
type AmaceResult = {
  appName: string;
  pkgName: string;
  runID: string;
  runTS: string;
  appTS: string;
  status: number;
  buildInfo: string;
  deviceInfo: string;
  isGame: boolean;
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
