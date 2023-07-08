import React, {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { MdArrowDownward, MdArrowUpward, MdContentCopy } from "react-icons/md";
import { debounce, filter, filterOptions } from "~/utils/algos";
import ViewHistoryModal from "./modals/ViewHistoryModal";
import ViewLogsModal from "./modals/ViewLogsModal";
import { get } from "http";
import { colors } from "~/utils/dateUtils";
import { Tooltip } from "react-tooltip";
import ResultLink from "./ResultLink";
import TableToClipBoard from "./TableToClipBoard";
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

interface AmaceResultRowProps {
  amaceResult: AmaceDBResult;
  decoratedPackageName?: string;

  setShowHistory(show: boolean): void;
  setShowLogs(show: boolean): void;
  onSelectHistory(text: string): void;
  onSelectLogs(text: string): void;
  onSelectAppName(text: string): void;
}

const AmaceResultRow: React.FC<AmaceResultRowProps> = ({
  amaceResult,
  decoratedPackageName,
  setShowLogs,
  setShowHistory,
  onSelectHistory,
  onSelectLogs,
  onSelectAppName,
}) => {
  const {
    pkgName,
    appName,
    status,
    brokenStatus,
    appTS,
    runID,
    runTS,
    deviceInfo,
    buildInfo,
    appType,
    appVersion,
    history,
    logs,
  } = amaceResult;
  console.log(
    "Result row:::: ",

    runTS
  );
  // console.log("decoratedPackageNames", decoratedPackageName);
  const hasLogs = logs?.length > 0 ?? false;
  return (
    <>
      <tr
        className={`${
          status > 0
            ? "border border-slate-600 bg-slate-900"
            : "border border-rose-600 bg-rose-900"
        }  text-white`}
        key={runTS.toString()}
      >
        <td
          className={`sticky left-0   ${
            status > 0
              ? "bg-gradient-to-r from-slate-900 via-slate-900 to-slate-700"
              : "bg-gradient-to-r from-rose-900 via-rose-900 to-rose-700"
          }  px-6 py-4 text-xs font-medium`}
          dangerouslySetInnerHTML={{
            __html:
              decoratedPackageName && decoratedPackageName.length > 0
                ? decoratedPackageName
                : pkgName,
          }}
        ></td>

        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {appName}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {status_reasons.get(status.toString())}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {brokenStatus_reasons.get(brokenStatus.toString())}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {appType}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {appVersion}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {displayDateWithTime(new Date(appTS))}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {runID}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {displayDate(new Date(runTS))}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {deviceInfo}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
          {buildInfo}
        </td>
        <td
          onClick={() => {
            if (history) {
              onSelectAppName(appName);
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
              onSelectAppName(appName);
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

const splitDateStringWithColor = (dateString: string): React.ReactNode[] => {
  const chunks: string[] = dateString.split(" ");

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

const genText = (rows: AmaceDBResult[]) => {
  const header =
    "Package Name\tName\tStatus\tBroken Status\tApp Type\tApp Version\tApp TS\tRun ID\tRun TS\tDevice Info\tBuild Info\tHistory\tLogs\n";
  const data = [header];
  rows.forEach((row: AmaceDBResult) => {
    const {
      appName,
      appTS,
      buildInfo,
      deviceInfo,
      pkgName,
      runID,
      runTS,
      status,
      brokenStatus,
      appType,
      appVersion,
      history,
      logs,
    } = row;

    // TODO remove replaceALl, amace.go is updated to strip the \n now...
    data.push(
      `${pkgName}\t${appName}\t${
        status_reasons.get(status.toString()) ?? "failedtogetkey"
      }\t${
        brokenStatus_reasons.get(brokenStatus.toString()) ?? "failedtogetkey2"
      }\t${appType}\t${appVersion}\t${displayDateWithTime(
        new Date(appTS)
      )}\t${runID}\t${displayDate(new Date(runTS))}\t${deviceInfo.replaceAll(
        "\n",
        ""
      )}\t${buildInfo}\t${history}\t${logs}\n`
    );
  });
  return data.join("");
};

const AmaceResultTable: React.FC<{
  amaceResults: AmaceDBResult[];
  height: number;
  parentKey: string;
  startDate: number;
  endDate: number;
  selectedDocID: string;
  page: string;
}> = ({
  amaceResults,
  height,
  parentKey,
  startDate,
  endDate,
  selectedDocID,
  page,
}) => {
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

  const [sortKey, setSortKey] = useState("pkgName");
  //  Package Name, Name, Status, App TS, Run ID, device, Build               => Change this Headers and keysToIdx when adding new items to sort by
  const [sortDirs, setSortDirs] = useState([
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  ]); // toggle between 1 and -1 by multiplying by -1

  // Sort by keys
  const keysToIdx = {
    pkgName: 0,
    appName: 1,
    status: 2,
    brokenStatus: 3,
    appType: 4,
    appVersion: 5,
    appTS: 6,
    runID: 7,
    runTS: 8,
    deviceInfo: 9,
    buildInfo: 10,
    history: 11,
    logs: 12,
  };

  useLayoutEffect(() => {
    setFilteredPackageNames(
      Array.from(Array(amaceResults.length).keys()).map((idx) => idx)
    );

    const packageNameMarks = new Map<string, string>();
    amaceResults.forEach((amaceResult: AmaceDBResult) => {
      packageNameMarks.set(
        amaceResult.pkgName ?? "",
        amaceResult.pkgName ?? ""
      );
    });
    setFilteredPackageNamesDecoratedStings(packageNameMarks);
  }, [amaceResults]);

  const filterText = (searchTerm: string): void => {
    console.log("Filtering: ", searchTerm);
    if (!searchTerm) {
      // reset to all results
      setFilteredPackageNames(
        Array.from(Array(amaceResults.length).keys()).map((idx) => idx)
      );
      const packageNameMarks = new Map<string, string>();
      amaceResults.forEach((amaceResult: AmaceDBResult) => {
        packageNameMarks.set(
          amaceResult.pkgName ?? "",
          amaceResult.pkgName ?? ""
        );
      });
      setFilteredPackageNamesDecoratedStings(packageNameMarks);
      return;
    }
    // Updates filtered data.
    const stringData = amaceResults.map(
      (amaceResult: AmaceDBResult) => amaceResult.pkgName
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
      const app = amaceResults[filterIdx];
      packageNameMarks.set(app?.pkgName ?? "", marks[idx] ?? "");
    });

    setFilteredPackageNamesDecoratedStings(packageNameMarks);
  };

  const onHeaderClick = (key: string, idx: number) => {
    console.log(`${key} ${idx}`);

    if (key === sortKey) {
      // If key is already selected, toggle direction
      sortDirs[idx] *= -1;
      setSortDirs([...sortDirs]);
    }
    setSortKey(key as keyof AmaceDBResult);
  };

  const debFilterText = debounce(filterText, 350);

  const resultState = amaceResults
    .filter((_, i: number) => filteredPackageNames.indexOf(i) >= 0)
    .sort((amaceResult: AmaceDBResult, amaceResultB: AmaceDBResult) => {
      const sortDirIdx = keysToIdx[sortKey as keyof typeof keysToIdx];
      const sortDir = sortDirs[sortDirIdx] ?? 0;
      return amaceResult[sortKey as keyof AmaceDBResult] <
        amaceResultB[sortKey as keyof AmaceDBResult]
        ? sortDir
        : -sortDir;
    });

  return (
    <div className={`min-w-full flex-1 bg-slate-900`}>
      <div className="mt-6 flex w-full items-center justify-around">
        <div className="flex w-1/2">
          <div className="w-2/3">
            <p className="ml-6 text-white">
              App results {`(${amaceResults.length}) `}
              {amaceResults && amaceResults[0] && amaceResults[0]?.runTS ? (
                splitDateStringWithColor(
                  displayDateWithTime(new Date(amaceResults[0].runTS))
                ).map((spanEl: React.ReactNode) => spanEl)
              ) : (
                <p>No date</p>
              )}
            </p>
          </div>
          <div className="flex w-1/3">
            <TableToClipBoard
              generateText={() => genText(resultState)}
              tootlTipText="Copy Table"
              key={"AmaceTable"}
            />
            <div className="ml-12 flex">
              <ResultLink
                startDate={startDate}
                endDate={endDate}
                selectedDocID={selectedDocID}
                page={page}
                key={selectedDocID}
              />
            </div>
          </div>
        </div>
        <div className="flex w-1/2 items-center p-1">
          <p className="mr-6 text-white">Filter</p>
          <input
            placeholder="Package name"
            className=" block h-[35px] w-[100px] rounded-lg border border-gray-300 bg-slate-900 p-2.5 text-sm  text-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:w-[300px]"
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              debFilterText(ev.target.value)
            }
          />
        </div>
      </div>
      <div className={`block max-h-[465px] overflow-y-auto bg-slate-900`}>
        {amaceResults && amaceResults.length ? (
          <table
            className={`max-w-full bg-slate-900 text-center text-sm font-light text-white`}
            key={"TableStatic"}
          >
            <thead className="sticky top-0 z-10 border-b border-neutral-500 bg-slate-900 font-medium">
              <tr>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("pkgName", 0);
                  }}
                  className=" bg-slate-900 px-6 py-4  hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Package NameZ{" "}
                    {sortDirs[0] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>

                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("appName", 1);
                  }}
                  className=" bg-slate-900 px-6 py-4  hover:bg-slate-700"
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
                  onClick={() => {
                    onHeaderClick("status", 2);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Status{" "}
                    {sortDirs[2] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => {
                    onHeaderClick("brokenStatus", 3);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Broken Status{" "}
                    {sortDirs[3] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => {
                    onHeaderClick("appType", 4);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    App Type{" "}
                    {sortDirs[4] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => {
                    onHeaderClick("appVersion", 5);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    App Version{" "}
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
                    onHeaderClick("appTS", 6);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    App TS{" "}
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
                    onHeaderClick("runID", 7);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Run ID{" "}
                    {sortDirs[7] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("runTS", 8);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Run TS{" "}
                    {sortDirs[8] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("deviceInfo", 9);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Device Info{" "}
                    {sortDirs[9] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("buildInfo", 10);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Build Info{" "}
                    {sortDirs[10] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("history", 11);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    History{" "}
                    {sortDirs[11] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("logs", 12);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Logs{" "}
                    {sortDirs[12] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody
              className="ml-5 overflow-y-auto bg-slate-900"
              key={parentKey}
            >
              {resultState.map((amaceResult: AmaceDBResult, idx: number) => {
                const curFilteredPackageNamesDecoratedStings =
                  filteredPackageNamesDecoratedStings?.get(amaceResult.pkgName);
                return (
                  <AmaceResultRow
                    key={`${amaceResult.appTS}_${amaceResult.runID}_${amaceResult.pkgName}`}
                    amaceResult={amaceResult}
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

export default AmaceResultTable;
