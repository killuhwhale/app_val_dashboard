import React, {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { filter, filterOptions } from "~/utils/algos";
import ViewHistoryModal from "./modals/ViewHistoryModal";
import ViewLogsModal from "./modals/ViewLogsModal";
import { get } from "http";

const displayDateWithTime = (date: Date): string => {
  return (
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("en-US")
  );
};

export const displayDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const status_reasons = new Map<string, string>();

status_reasons.set("-3", "LOGGED_IN_FACEBOOK");
status_reasons.set("-2", "LOGGED_IN_GOOLE");
status_reasons.set("-1", "LOGGED_IN_EMAIL");
status_reasons.set("0", "PASS");
status_reasons.set("1", "FAIL");
status_reasons.set("2", "CRASH_WIN_DEATH");
status_reasons.set("3", "CRASH_FORCE_RM_ACT_RECORD");
status_reasons.set("4", "CRASH_ANR");
status_reasons.set("5", "CRASH_FDEBUG_CRASH");
status_reasons.set("6", "CRASH_FATAL_EXCEPTION");
status_reasons.set("7", "NEEDS_PRICE");
status_reasons.set("8", "INVALID");
status_reasons.set("9", "DID_NOT_OPEN");

const AppResultRow: React.FC<AppResultRowProps> = ({
  appResult,
  decoratedPackageName,
  setShowLogs,
  setShowHistory,
  onSelectAppName,
  onSelectHistory,
  onSelectLogs,
}) => {
  const {
    status,
    package_name,
    name,
    report_title,
    run_id,
    run_ts,
    build,
    timestamp,
    reason,
    new_name,
    invalid,
    history,
    logs,
  } = appResult;
  const hasLogs = logs.length > 0;
  // console.log("decoratedPackageNames", decoratedPackageName);
  return (
    <>
      <tr
        className={`${
          parseInt(status) <= 0
            ? "border border-slate-600 bg-slate-900"
            : "border border-rose-600 bg-rose-900"
        }  text-white`}
        key={timestamp.toString()}
      >
        <td
          className={`sticky left-0   ${
            parseInt(status) <= 0
              ? "bg-gradient-to-r from-slate-900 via-slate-900 to-slate-700"
              : "bg-gradient-to-r from-rose-900 via-rose-900 to-rose-700"
          }  px-6 py-4 text-xs font-medium`}
          dangerouslySetInnerHTML={{
            __html:
              decoratedPackageName && decoratedPackageName.length > 0
                ? decoratedPackageName
                : package_name,
          }}
        ></td>

        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {status_reasons.get(status)}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {name}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {report_title}
        </td>
        {/* <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {run_id}
      </td> */}
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {displayDate(new Date(run_ts))}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {build}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {displayDateWithTime(new Date(timestamp))}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {reason}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {new_name}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {invalid}
        </td>
        <td
          onClick={() => {
            if (history) {
              onSelectAppName(name);
              onSelectHistory(history);
              setShowHistory(true);
            } else {
              console.log("No history to show");
            }
          }}
          className={`whitespace-nowrap px-6 py-4 text-xs font-medium ${
            parseInt(status) > 0 ? "hover:bg-rose-700" : "hover:bg-slate-700"
          }`}
        >
          Click to view history
        </td>
        <td
          onClick={() => {
            if (hasLogs) {
              onSelectAppName(name);
              onSelectLogs(logs);
              setShowLogs(true);
            } else {
              console.log("No logs to show");
            }
          }}
          className={`whitespace-nowrap px-6 py-4 text-xs font-medium  ${
            parseInt(status) > 0 ? "hover:bg-rose-700" : "hover:bg-slate-700"
          }`}
        >
          {hasLogs ? "Click to view logs" : "No Logs"}
        </td>
      </tr>
    </>
  );
};

const splitDateStringWithColor = (dateString: string): React.ReactNode[] => {
  const chunks: string[] = dateString.split(" ");

  const colors: string[] = [
    "text-red-500", // red
    "text-yellow-400", // yellow
    "text-green-400", // green
    "text-blue-400", // blue
    "text-purple-700", // purple
  ];

  const result: React.ReactNode[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk: string = chunks[i] ?? "";
    const color: string = colors[i % colors.length] ?? "";
    result.push(
      <span key={`${color}_${chunk}`} className={color}>
        {chunk}
      </span>
    );
  }

  return result;
};

const ResultTable: React.FC<{
  appResults: RawAppResult[];
  height: number;
  parentKey: string;
}> = ({ appResults, height, parentKey }) => {
  const [filteredPackageNames, setFilteredPackageNames] = useState<number[]>(
    []
  );
  const [
    filteredPackageNamesDecoratedStings,
    setFilteredPackageNamesDecoratedStings,
  ] = useState<Map<string, string>>(new Map());

  const [showHistory, setShowHistory] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selHistory, onSelectHistory] = useState("");
  const [selLogs, onSelectLogs] = useState("");
  const [selAppName, onSelectAppName] = useState("");

  const [sortKey, setSortKey] = useState("package_name");
  // Status, Package Name, Name, Report Title, Run Ts, Build,	Timestamp of app,	Reason, => Change this Headers and keysToIdx when adding new items to sort by
  const [sortDirs, setSortDirs] = useState([-1, -1, -1, -1, -1, -1, -1, -1]); // toggle between 1 and -1 by multiplying by -1

  // Sort by keys
  const keysToIdx = {
    status: 0,
    package_name: 1,
    name: 2,
    report_title: 3,
    run_ts: 4,
    build: 5,
    timestamp: 6,
    reason: 7,
  };

  useLayoutEffect(() => {
    console.log("appResults", appResults);

    console.log("setFilteredPackageNames");
    setFilteredPackageNames(
      Array.from(Array(appResults.length).keys()).map((idx) => idx)
    );

    // TODO update map to a;; results
    const packageNameMarks = new Map<string, string>();
    appResults.forEach((appResult: RawAppResult) => {
      packageNameMarks.set(
        appResult.package_name ?? "",
        appResult.package_name ?? ""
      );
    });
    setFilteredPackageNamesDecoratedStings(packageNameMarks);
  }, [appResults]);

  const filterText = (searchTerm: string) => {
    if (!searchTerm) {
      // reset to all results
      setFilteredPackageNames(
        Array.from(Array(appResults.length).keys()).map((idx) => idx)
      );
      // TODO update map to all results
      const packageNameMarks = new Map<string, string>();
      appResults.forEach((appResult: RawAppResult) => {
        packageNameMarks.set(
          appResult.package_name ?? "",
          appResult.package_name ?? ""
        );
      });
      setFilteredPackageNamesDecoratedStings(packageNameMarks);
      return;
    }
    // Updates filtered data.
    const stringData = appResults.map(
      (result: RawAppResult) => result.package_name
    );
    // console.log("Filter text: ", searchTerm, stringData);
    const options: filterOptions = {
      word: false,
    };
    const { items, marks } = filter(searchTerm, stringData, options);
    // console.log("Filter results: ", marks);
    setFilteredPackageNames(items);
    const packageNameMarks = new Map<string, string>();
    items.forEach((filterIdx: number, idx: number) => {
      const app = appResults[filterIdx];
      packageNameMarks.set(app?.package_name ?? "", marks[idx] ?? "");
    });

    setFilteredPackageNamesDecoratedStings(packageNameMarks);
  };

  const onHeaderClick = (key: string, idx: number) => {
    console.log(`${key} ${idx}`);

    if (key === sortKey) {
      // If key is already selected, toggle direction
      console.log("Setting sort Dirs: ", sortDirs);
      sortDirs[idx] *= -1;
      console.log("Setting sort Dirs: ", sortDirs);
      setSortDirs([...sortDirs]);
    }
    setSortKey(key as keyof RawAppResult);
  };

  return (
    <div className={`min-w-full flex-1 bg-slate-900`}>
      <div className="mt-6 flex w-full items-center justify-around">
        <div className="w-1/2">
          <p className="ml-6 text-white">
            App results{" "}
            {appResults && appResults[0] && appResults[0]?.run_ts ? (
              splitDateStringWithColor(
                displayDateWithTime(new Date(appResults[0].run_ts))
              ).map((spanEl: React.ReactNode) => spanEl)
            ) : (
              <p>No date</p>
            )}
          </p>
        </div>
        <div className="flex w-1/2 items-center">
          <p className="mr-6 text-white">Filter</p>
          <input
            placeholder="Package name"
            className=" block h-[40px] w-[100px] rounded-lg border border-gray-300 bg-slate-900 p-2.5 text-sm  text-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:w-[300px]"
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              filterText(ev.target.value)
            }
          />
        </div>
      </div>
      <div className={`block max-h-[465px] overflow-y-auto bg-slate-900`}>
        {appResults && appResults.length ? (
          <table
            className={`max-w-full bg-slate-900 text-center text-sm font-light text-white`}
            key={"TableStatic"}
          >
            <thead className="sticky top-0 z-50 border-b border-neutral-500 bg-slate-900 font-medium">
              <tr>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("package_name", 1);
                  }}
                  className=" bg-slate-900 px-6 py-4  hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Package Name{" "}
                    {sortDirs[1] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>

                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("status", 0);
                  }}
                  className=" bg-slate-900 px-6 py-4  hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Status{" "}
                    {sortDirs[0] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => {
                    onHeaderClick("name", 2);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Name{" "}
                    {sortDirs[2] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("report_title", 3);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Report Title{" "}
                    {sortDirs[3] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                {/* <th scope="col" className="px-6 py-4">
                  Run Id
                </th> */}
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("run_ts", 4);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Run TS{" "}
                    {sortDirs[4] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("build", 5);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Build{" "}
                    {sortDirs[5] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("timestamp", 6);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Timestamp of app{" "}
                    {sortDirs[6] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("reason", 7);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Reason{" "}
                    {sortDirs[7] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-4">
                  New_name
                </th>
                <th scope="col" className="px-6 py-4">
                  Invalid
                </th>
                <th scope="col" className="px-6 py-4">
                  History
                </th>
                <th scope="col" className="px-6 py-4">
                  Logs
                </th>
              </tr>
            </thead>
            <tbody
              className="ml-5 overflow-y-auto bg-slate-900"
              key={parentKey}
            >
              {appResults
                .filter((_, i: number) => filteredPackageNames.indexOf(i) >= 0)
                .sort((appResult: RawAppResult, appResultB: RawAppResult) => {
                  const sortDirIdx =
                    keysToIdx[sortKey as keyof typeof keysToIdx];
                  const sortDir = sortDirs[sortDirIdx] ?? 0;
                  return appResult[sortKey as keyof RawAppResult] <
                    appResultB[sortKey as keyof RawAppResult]
                    ? sortDir
                    : -sortDir;
                })
                .map((appResult: RawAppResult, idx: number) => {
                  const curFilteredPackageNamesDecoratedStings =
                    filteredPackageNamesDecoratedStings?.get(
                      appResult.package_name
                    );
                  return (
                    <AppResultRow
                      key={`${appResult.run_id}_${appResult.report_title}_${appResult.package_name}`}
                      appResult={appResult}
                      setShowHistory={(show: boolean) => setShowHistory(show)}
                      setShowLogs={(show: boolean) => setShowLogs(show)}
                      onSelectHistory={(text: string) => onSelectHistory(text)}
                      onSelectLogs={(text: string) => onSelectLogs(text)}
                      onSelectAppName={(text: string) => onSelectAppName(text)}
                      decoratedPackageName={
                        curFilteredPackageNamesDecoratedStings
                      }
                    />
                  );
                })}
            </tbody>
          </table>
        ) : (
          <></>
        )}

        <ViewHistoryModal
          isOpen={showHistory}
          history={selHistory}
          appName={selAppName}
          onClose={() => setShowHistory(!showHistory)}
        />

        <ViewLogsModal
          isOpen={showLogs}
          logs={selLogs}
          onClose={() => setShowLogs(!showLogs)}
          appName={selAppName}
        />
      </div>
    </div>
  );
};

export default ResultTable;
