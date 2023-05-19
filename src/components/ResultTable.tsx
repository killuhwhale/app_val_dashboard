import React, { ChangeEvent, useEffect, useState } from "react";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { filter, filterOptions } from "~/utils/algos";
import ViewHistoryModal from "./modals/ViewHistoryModal";
import ViewLogsModal from "./modals/ViewLogsModal";

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
  console.log("decoratedPackageNames", decoratedPackageName);
  return (
    <>
      <tr
        className={`${
          status <= 0
            ? "border border-slate-600 bg-slate-900"
            : "border border-rose-600 bg-rose-900"
        }  text-white`}
        key={timestamp.toString()}
      >
        <td
          className={`sticky left-0   ${
            status <= 0
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
          {name}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {report_title}
        </td>
        {/* <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {run_id}
      </td> */}
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {displayDate(new Date(run_ts.seconds * 1000))}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {build}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {displayDateWithTime(new Date(timestamp.seconds * 1000))}
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
            status > 0 ? "hover:bg-rose-700" : "hover:bg-slate-700"
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
            status > 0 ? "hover:bg-rose-700" : "hover:bg-slate-700"
          }`}
        >
          {hasLogs ? "Click to view logs" : "No Logs"}
        </td>
      </tr>
    </>
  );
};

const splitDateStringWithColor = (dateString: string): any[] => {
  const chunks: string[] = dateString.split(" ");

  const colors: string[] = [
    "text-red-500", // red
    "text-yellow-400", // yellow
    "text-green-400", // green
    "text-blue-400", // blue
    "text-purple-700", // purple
  ];

  const result: any[] = [];

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

const AppResults: React.FC<{
  appResults: AppResult[];
  height: number;
  parentKey: string;
}> = ({ appResults, height, parentKey }) => {
  const [filteredPackageNames, setFilteredPackageNames] = useState<number[]>(
    []
  );
  const [
    filteredPackageNamesDecoratedStings,
    setFilteredPackageNamesDecoratedStings,
  ] = useState<string[]>([]);

  const [showHistory, setShowHistory] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selHistory, onSelectHistory] = useState("");
  const [selLogs, onSelectLogs] = useState("");
  const [selAppName, onSelectAppName] = useState("");

  const [sortKey, setSortKey] = useState("package_name");
  // Package Name Name Report Title Run Ts	Timestamp of app	Reason
  const [sortDirs, setSortDirs] = useState([-1, -1, -1, -1, -1, -1]); // toggle between 1 and -1 by multiplying by -1

  const keysToIdx = {
    package_name: 0,
    name: 1,
    report_title: 2,
    run_ts: 3,
    timestamp: 4,
    reason: 5,
  };

  useEffect(() => {
    console.log("appResults", appResults);

    console.log("setFilteredPackageNames");
    setFilteredPackageNames(
      Array.from(Array(appResults.length).keys()).map((idx) => idx)
    );
    setFilteredPackageNamesDecoratedStings(
      appResults.map((result: AppResult) => {
        return result.package_name;
      })
    );
  }, [appResults]);

  const filterText = (searchTerm: string) => {
    if (!searchTerm) {
      // reset to all results
      setFilteredPackageNames(
        Array.from(Array(appResults.length).keys()).map((idx) => idx)
      );
      setFilteredPackageNamesDecoratedStings(
        appResults.map((result: AppResult) => {
          return result.package_name;
        })
      );
      return;
    }
    // Updates filtered data.
    const stringData = appResults.map(
      (result: AppResult) => result.package_name
    );
    // console.log("Filter text: ", searchTerm, stringData);
    const options: filterOptions = {
      word: false,
    };
    const { items, marks } = filter(searchTerm, stringData, options);
    // console.log("Filter results: ", marks);
    setFilteredPackageNames(items);
    setFilteredPackageNamesDecoratedStings(marks);
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
    setSortKey(key as keyof AppResult);
  };

  return (
    <div className={`min-w-full flex-1 bg-slate-900`}>
      <div className="mt-6 flex w-full items-center justify-around">
        <div className="w-1/2">
          <p className="ml-6 text-white">
            App results{" "}
            {appResults[0]!?.run_ts.seconds ? (
              splitDateStringWithColor(
                displayDateWithTime(
                  new Date(appResults[0]!?.run_ts.seconds * 1000)
                )
              ).map((spanEl: any) => spanEl)
            ) : (
              <></>
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
        <table
          className={`max-w-full bg-slate-900 text-center text-sm font-light text-white`}
          key={"TableStatic"}
        >
          <thead className="border-b font-medium dark:border-neutral-500">
            <tr>
              <th
                scope="col"
                onClick={() => {
                  onHeaderClick("package_name", 0);
                }}
                className="sticky left-0 bg-slate-900 px-6 py-4  hover:bg-slate-700"
              >
                <div className="flex items-center justify-center">
                  Package Name{" "}
                  {sortDirs[0] === -1 ? (
                    <MdArrowDownward size={24} />
                  ) : (
                    <MdArrowUpward size={24} />
                  )}
                </div>
              </th>
              <th
                onClick={() => {
                  onHeaderClick("name", 1);
                }}
                className="px-6 py-4 hover:bg-slate-700"
              >
                <div className="flex items-center justify-center">
                  Name{" "}
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
                  onHeaderClick("report_title", 2);
                }}
                className="px-6 py-4 hover:bg-slate-700"
              >
                <div className="flex items-center justify-center">
                  Report Title{" "}
                  {sortDirs[2] === -1 ? (
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
                  onHeaderClick("run_ts", 3);
                }}
                className="px-6 py-4 hover:bg-slate-700"
              >
                <div className="flex items-center justify-center">
                  Run TS{" "}
                  {sortDirs[3] === -1 ? (
                    <MdArrowDownward size={24} />
                  ) : (
                    <MdArrowUpward size={24} />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-4">
                Build
              </th>
              <th
                scope="col"
                onClick={() => {
                  onHeaderClick("timestamp", 4);
                }}
                className="px-6 py-4 hover:bg-slate-700"
              >
                <div className="flex items-center justify-center">
                  Timestamp of app{" "}
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
                  onHeaderClick("reason", 5);
                }}
                className="px-6 py-4 hover:bg-slate-700"
              >
                <div className="flex items-center justify-center">
                  Reason{" "}
                  {sortDirs[5] === -1 ? (
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
          <tbody className="overflow-y-auto bg-slate-900" key={parentKey}>
            {appResults && appResults.length ? (
              appResults
                .filter((_, i: number) => filteredPackageNames.indexOf(i) >= 0)
                .sort((appResult: AppResult, appResultB: AppResult) => {
                  const sortDirIdx =
                    keysToIdx[sortKey as keyof typeof keysToIdx];
                  const sortDir = sortDirs[sortDirIdx] ?? 0;
                  return appResult[sortKey as keyof AppResult] <
                    appResultB[sortKey as keyof AppResult]
                    ? sortDir
                    : -sortDir;
                })
                .map((appResult: AppResult, idx: number) => {
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
                        filteredPackageNamesDecoratedStings[idx]
                      }
                    />
                  );
                })
            ) : (
              <tr className="border-primary-200 bg-primary-100 border-b text-neutral-800">
                <td className="whitespace-nowrap px-6 py-4 font-medium">
                  Primary
                </td>
                <td className="whitespace-nowrap px-6 py-4">Cell</td>
                <td className="whitespace-nowrap px-6 py-4">Cell</td>
              </tr>
            )}
          </tbody>
        </table>
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

export default AppResults;
