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
