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

// Display String based on status
status_reasons.set("0", "Fail");
status_reasons.set("1", "Needs purchase");
status_reasons.set("2", "App is old");
status_reasons.set("3", "Failed to install");
status_reasons.set("4", "Device not compatible");
status_reasons.set("5", "Country NA");
status_reasons.set("6", "O4C");
status_reasons.set("7", "O4C FS only");
status_reasons.set("8", "FS -> Amace");
status_reasons.set("9", "Phone only");
status_reasons.set("10", "Tablet only");
status_reasons.set("11", "Amace");
status_reasons.set("12", "PWA");

interface AmaceResultRowProps {
  amaceResult: AmaceDBResult;
  decoratedPackageName?: string;

  onSelectAppName(text: string): void;
}

const AmaceResultRow: React.FC<AmaceResultRowProps> = ({
  amaceResult,
  decoratedPackageName,
  onSelectAppName,
}) => {
  const {
    pkgName,
    appName,
    status,
    appTS,
    runID,
    runTS,
    deviceInfo,
    buildInfo,
    isGame,
  } = amaceResult;

  // console.log("decoratedPackageNames", decoratedPackageName);
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
          {isGame ? "Game" : "App"}
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
  return rows
    .map((row: AmaceDBResult) => {
      const {
        appName,
        appTS,
        buildInfo,
        deviceInfo,
        isGame,
        pkgName,
        runID,
        runTS,
        status,
      } = row;

      // TODO remove replaceALl, amace.go is updated to strip the \n now...
      return `${pkgName}\t${appName}\t${
        status_reasons.get(status.toString()) ?? "failedtogetkey"
      }\t${isGame ? "Game" : "App"}\t${displayDateWithTime(
        new Date(appTS)
      )}\t${runID}\t${displayDate(new Date(runTS))}\t${deviceInfo.replaceAll(
        "\n",
        ""
      )}\t${buildInfo}\n`;
    })
    .join("");
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

  const [sortKey, setSortKey] = useState("package_name");
  //  Package Name, Name, Status, App TS, Run ID, device, Build               => Change this Headers and keysToIdx when adding new items to sort by
  const [sortDirs, setSortDirs] = useState([
    -1, -1, -1, -1, -1, -1, -1, -1, -1,
  ]); // toggle between 1 and -1 by multiplying by -1

  // Sort by keys
  const keysToIdx = {
    pkgName: 0,
    appName: 1,
    status: 2,
    isGame: 3,
    appTS: 4,
    runID: 5,
    runTS: 6,
    deviceInfo: 7,
    buildInfo: 8,
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
                    onHeaderClick("appName", 1);
                  }}
                  className=" bg-slate-900 px-6 py-4  hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Name{" "}
                    {sortDirs[0] === -1 ? (
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
                    onHeaderClick("isGame", 3);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Game{" "}
                    {sortDirs[3] === -1 ? (
                      <MdArrowDownward size={24} />
                    ) : (
                      <MdArrowUpward size={24} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => {
                    onHeaderClick("appTS", 4);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    App TS{" "}
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
                    onHeaderClick("runID", 5);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Run ID{" "}
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
                    onHeaderClick("runTS", 6);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Run TS{" "}
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
                    onHeaderClick("deviceInfo", 7);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Device Info{" "}
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
                    onHeaderClick("buildInfo", 8);
                  }}
                  className="px-6 py-4 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-center">
                    Build Info{" "}
                    {sortDirs[8] === -1 ? (
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
                    key={`${amaceResult.runTS}_${amaceResult.runID}_${amaceResult.pkgName}`}
                    amaceResult={amaceResult}
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
