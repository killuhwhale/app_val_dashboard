"use client";
import { signIn, signOut, useSession } from "next-auth/react";

import { signInWithCustomToken } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { Value } from "react-calendar/dist/cjs/shared/types";
import { api } from "~/utils/api";
import { frontEndAuth, frontFirestore } from "~/utils/frontFirestore";

interface ContainerProps extends React.PropsWithChildren {
  height?: string;
}
const ThirdColumn: React.FC<ContainerProps> = ({ children }) => {
  const ac = React.Children.toArray(children);
  return (
    <div className="mb-4 grid grid-cols-3 gap-4">
      <div className="flex h-24 items-center justify-center rounded bg-slate-900  text-white">
        {ac[0]}
      </div>
      <div className="flex h-24 items-center justify-center rounded bg-slate-900  text-white">
        {ac[1]}
      </div>
      <div className="flex h-24 items-center justify-center rounded bg-slate-900  text-white">
        {ac[2]}
      </div>
    </div>
  );
};

const FullColumn: React.FC<ContainerProps> = ({ children, height }) => {
  return (
    <div className="mb-4">
      <div
        className={`${height ? height : ""}
        flex items-start justify-center rounded bg-slate-900`}
      >
        {children}
      </div>
    </div>
  );
};
const HalfColumn: React.FC<ContainerProps> = ({ children }) => {
  const ac = React.Children.toArray(children);
  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex h-28 items-center justify-center rounded bg-slate-900 text-white">
          {ac[0]}
        </div>
        <div className="flex h-28 items-center justify-center rounded rounded bg-slate-900 text-white">
          {ac[1]}
        </div>
      </div>
    </div>
  );
};

const DatePicker: React.FC<{
  startDay: Date;
  endDay: Date;
  onStartSelect(date: string): void;
  onEndSelect(date: string): void;
}> = (props) => {
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  return (
    <div className="z-20 flex h-full w-full flex-col items-center  bg-slate-800">
      <div className="flex h-full items-center">
        <div className="relative w-1/2 max-w-sm pr-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            readOnly
            onClick={() => setShowStartDate(!showStartDate)}
            className="block h-[40px] w-[300px] rounded-lg border border-gray-300 bg-slate-900 p-2.5 pl-10 text-sm text-white focus:border-blue-500 focus:ring-blue-500 "
            placeholder="Select date"
            value={props.startDay.toString().split(" ").slice(0, 4).join(" ")}
          />
        </div>

        <div className=" relative w-1/2 max-w-sm pl-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-9">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            readOnly
            onClick={() => setShowEndDate(!showEndDate)}
            className=" block h-[40px] w-[300px] rounded-lg border border-gray-300 bg-slate-900 p-2.5 pl-10 text-sm text-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Select date"
            value={props.endDay.toString().split(" ").slice(0, 4).join(" ")}
          />
        </div>
      </div>

      <div className="flex ">
        <div className="mr-6 w-[300px] ">
          <Calendar
            className={`${
              !showStartDate ? "hidden" : ""
            } rounded-2xl bg-slate-900 p-2 text-white`}
            calendarType="US"
            key="StartDateSelect"
            value={props.startDay}
            tileClassName={({ date, view }) => {
              if (formatDateToString(date) == formatDateToString(new Date())) {
                return "bg-slate-400 text-black rounded-xl";
              } else if (
                formatDateToString(date) == formatDateToString(props.startDay)
              ) {
                return "bg-slate-100 text-black rounded-xl";
              }
            }}
            onChange={(value: Value) => {
              if (!value || value >= props.endDay) return;
              setShowStartDate(false);
              props.onStartSelect(value?.toString() ?? "");
            }}
          />
        </div>
        <div className="ml-6 w-[300px]">
          <Calendar
            calendarType="US"
            className={`pl-5 ${
              !showEndDate ? "hidden" : ""
            } rounded-2xl bg-slate-900 p-2 text-white`}
            key="EndDateSelect"
            value={props.endDay}
            tileClassName={({ date, view }) => {
              if (formatDateToString(date) == formatDateToString(new Date())) {
                return "bg-slate-400 text-black rounded-xl";
              } else if (
                formatDateToString(date) == formatDateToString(props.endDay)
              ) {
                return "bg-slate-100 text-black rounded-xl";
              }
            }}
            onChange={(value: Value) => {
              if (!value || value <= props.startDay) return;
              setShowEndDate(false);
              props.onEndSelect(value?.toString() ?? "");
            }}
          />
        </div>
      </div>
    </div>
  );
};

const useFirebaseSession = () => {
  const session = useSession();
  const [status, setStatus] = useState(session.status);

  useEffect(() => {
    if (status == "authenticated") return;

    if (session && session.status === "authenticated") {
      // signInWithCredential(auth, )  TODO() Setup Firebase/Auth for lcient side?
      console.log("signInWithCustomToken", session.data.user);

      signInWithCustomToken(frontEndAuth, session.data.user.custom_token).then(
        () => {
          setStatus("authenticated");
        }
      );
    }
  }, [session]);

  useEffect(() => {
    if (session.status !== "authenticated") {
      setStatus(session.status);
    }
  }, [session.status]);

  return { data: session.data, status };
};

interface FBDate {
  seconds: number;
  nanoseconds: number;
}

interface AppResult {
  status: number;
  package_name: string;
  name: string;
  report_title: string;
  run_id: string;
  run_ts: FBDate;
  build: string;
  timestamp: FBDate;
  reason: string;
  new_name: string;
  invalid: string;
  history: string;
  logs: string;
}

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
const displayDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const AppResultRuns: React.FC<{
  docs: QueryDocumentSnapshot<DocumentData>[];
  height: number;
  onSelect(sDoc: QueryDocumentSnapshot<DocumentData>): void;
}> = ({ docs, height, onSelect }) => {
  return (
    <div className={`max-h-[${height}px]`}>
      <p className="pl-4 pt-2 text-white">App runs: {docs.length}</p>
      <div className={`h-[${height}px] flex  space-x-4 overflow-x-scroll  p-2`}>
        {docs && docs.length ? (
          [...docs, ...docs, ...docs, ...docs, ...docs].map(
            (docu: QueryDocumentSnapshot<DocumentData>) => {
              return (
                <div
                  className="max-h-[30px] min-h-[60px] min-w-[180px] border border-slate-400 bg-slate-900 p-4 text-white hover:bg-slate-700"
                  onClick={() => onSelect(docu)}
                >
                  <p className="text-xs sm:text-sm md:text-base ">
                    {displayDate(new Date(docu.data().date.seconds * 1000))}
                  </p>
                </div>
              );
            }
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

const AppResults: React.FC<{
  doc: QueryDocumentSnapshot<DocumentData>;
  height: number;
}> = ({ doc, height }) => {
  const [appResults, setAppResults] = useState<AppResult[]>([]);

  useEffect(() => {
    let _appResults: AppResult[] = [];
    if (appResults.length > 0) return;
    const getSubCollection = async () => {
      const results = await getDocs(
        collection(frontFirestore, `AppRuns/${doc.id}/apps`)
      );

      results.forEach((appData) => {
        console.log("appData: ", appData.data());
        _appResults.push(appData.data() as AppResult);
      });
      setAppResults(_appResults);
    };

    getSubCollection();
  }, [appResults]);

  return (
    <div className="min-w-full bg-slate-900 ">
      <div className={`h-[${height}px] overflow-auto bg-slate-900`}>
        <table
          className=" max-w-full overflow-x-scroll bg-slate-900 text-center text-sm font-light text-white"
          key={doc.id}
        >
          <thead className="border-b font-medium dark:border-neutral-500">
            <tr>
              <th scope="col" className="px-6 py-4">
                Package Name
              </th>
              <th scope="col" className="px-6 py-4">
                Name
              </th>
              <th scope="col" className="px-6 py-4">
                Report Title
              </th>
              {/* <th scope="col" className="px-6 py-4">
                Run Id
              </th> */}
              <th scope="col" className="px-6 py-4">
                Run Ts
              </th>
              <th scope="col" className="px-6 py-4">
                Build
              </th>
              <th scope="col" className="px-6 py-4">
                Timestamp of app
              </th>
              <th scope="col" className="px-6 py-4">
                Reason
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
          <tbody className="bg-slate-900">
            {appResults && appResults.length ? (
              [
                ...appResults,
                ...appResults,
                ...appResults,
                ...appResults,
                ...appResults,
                ...appResults,
              ].map((appResult: AppResult) => {
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
                return (
                  <tr
                    className={`${
                      status == 1
                        ? "border border-slate-600 bg-slate-900"
                        : "border border-rose-600 bg-rose-900"
                    }  text-white`}
                    key={timestamp.toString()}
                  >
                    <td className=" whitespace-nowrap px-6 py-4 text-xs font-medium">
                      {package_name}
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
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
                      {history}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
                      {logs}
                    </td>
                  </tr>
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
      </div>
    </div>
  );
};

const monthMap = new Map<string, number>([
  ["Jan", 1],
  ["Feb", 2],
  ["Mar", 3],
  ["Apr", 4],
  ["May", 5],
  ["Jun", 6],
  ["Jul", 7],
  ["Aug", 8],
  ["Sep", 9],
  ["Oct", 10],
  ["Nov", 11],
  ["Dec", 12],
]);

const formatDateToString = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

const formatFirebaseDate = (date: Date): Date => {
  return new Date(formatDateToString(date).replace(/\//g, "-"));
};

const formatFromDatepickerToFirebase = (date: string): Date => {
  console.log("Date picker date needs formatting: ", date);
  // 0    1   2   3      4       5        6       7        8
  // Wed May 17 2023 00:00:00 GMT-0700 (Pacific Daylight Time)

  const dateInfo = date.split(" ");
  const d = dateInfo[2];
  const m = monthMap.get(dateInfo[1] ?? "Jan");
  const y = dateInfo[3];
  return new Date(`${m} ${d} ${y}`);
};

const Home: React.FC = () => {
  const [init, setInit] = useState(true);
  const [appRunResults, setAppRunResults] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [selectedDoc, setSelectedDoc] =
    useState<QueryDocumentSnapshot<DocumentData>>();

  const days = 4;
  const [startDate, setStartDate] = useState(
    new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [lastStartDate, setLastStartDate] = useState("");
  const [lastEndDate, setLastEndDate] = useState("");

  const sesh = useFirebaseSession();
  console.log(sesh);

  useEffect(() => {
    if (
      startDate.toString() === lastStartDate &&
      endDate.toString() === lastEndDate
    )
      return;

    const q = query(
      collection(frontFirestore, "AppRuns"),
      where("date", ">=", formatFirebaseDate(startDate)),
      where("date", "<=", formatFirebaseDate(endDate))
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      let appRuns: QueryDocumentSnapshot<DocumentData>[] = [];

      querySnapshot.forEach(async (doc) => {
        console.log("QuerySnapshot doc: ", doc.data());
        appRuns.push(doc);
      });
      setAppRunResults(appRuns);
      if (init && appRuns[0]) {
        setSelectedDoc(appRuns[0]);
      }
    });
    setInit(false);
    setLastStartDate(startDate.toString());
    setLastEndDate(endDate.toString());
  }, [init, startDate, endDate]);

  return (
    <>
      <FullColumn height="h-[40px]">
        <DatePicker
          onStartSelect={(date) =>
            setStartDate(formatFromDatepickerToFirebase(date))
          }
          onEndSelect={(date) =>
            setEndDate(formatFromDatepickerToFirebase(date))
          }
          startDay={startDate}
          endDay={endDate}
        />
      </FullColumn>

      <FullColumn height="h-[120px] ">
        <div className="h-full  w-full items-center justify-center bg-slate-800">
          <AppResultRuns
            docs={appRunResults}
            height={110}
            onSelect={(sDoc) => setSelectedDoc(sDoc)}
          />
        </div>
      </FullColumn>

      <FullColumn height="h-[500px] mt-6">
        {selectedDoc ? (
          <AppResults
            height={500}
            key={`key__${selectedDoc.id}`}
            doc={selectedDoc}
          />
        ) : (
          <></>
        )}
      </FullColumn>
      <HalfColumn>
        <p>left</p>
        <p>Right</p>
      </HalfColumn>
      <ThirdColumn>
        <p>Left</p>
        <p>Middle</p>
        <p>Right</p>
      </ThirdColumn>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
