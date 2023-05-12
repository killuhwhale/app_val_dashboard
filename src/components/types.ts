interface AppResult {
  status: number;
  package_name: string;
  name: string;
  report_title: string;
  timestamp: number;
  reason: string;
  new_name: string;
  invalid: boolean;
  history: string;
  logs: string;
}
