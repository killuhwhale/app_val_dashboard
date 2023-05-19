type FirebaseDate = {
  seconds: number;
  nanoseconds: number;
};

type AppRun = {
  date: FirebaseDate;
};

type AppResult = {
  status: number;
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
  status: number;
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
  appResult: AppResult;
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
