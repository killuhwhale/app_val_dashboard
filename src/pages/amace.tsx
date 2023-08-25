"use client";

import { Unsubscribe } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdViewModule } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import AmaceResultTable from "~/components/AmaceResultTable";
import AmaceRuns from "~/components/AmaceRuns";
import DatePicker from "~/components/AppValDatePicker";
import ResultLink from "~/components/ResultLink";
import BarChartPassFailTotals from "~/components/charts/BarChartPassFailTotals";
import FullColumn from "~/components/columns/FullColumn";
import Dropdown from "~/components/select/dropdown";
import { wssURL } from "~/components/shared";

import { processStats } from "~/utils/chartUtils";
import {
  formatFirebaseDate,
  formatFromDatepickerToFirebase,
} from "~/utils/dateUtils";
import { frontFirestore, useFirebaseSession } from "~/utils/frontFirestore";

type AppsScriptUrlFB = {
  url: string;
};
export const isBrowser = typeof window !== "undefined";
const AMACEPage: React.FC = () => {
  const [init, setInit] = useState(true);
  const unSubRangeResultsRef = useRef<Unsubscribe>();
  const unSubRef = useRef<Unsubscribe>();
  const [appRunResults, setAppRunResults] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [selectedDoc, setSelectedDoc] =
    useState<QueryDocumentSnapshot<DocumentData>>();

  const days = 4;

  const router = useRouter();
  const { query: _query } = router;
  // Access individual query parameters
  const qStartDate = _query.s_d as string;
  const qEndDate = _query.e_d as string;
  const qSelectedDocID = _query.id as string;

  const [startDate, setStartDate] = useState(
    qStartDate
      ? new Date(parseInt(qStartDate))
      : new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(
    qEndDate
      ? new Date(parseInt(qEndDate))
      : new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
  );
  const [lastStartDate, setLastStartDate] = useState("");
  const [lastEndDate, setLastEndDate] = useState("");
  const [totalByStatus, setTotalByStatus] = useState<BarLineChartDataPoint[]>(
    []
  );

  const sesh = useFirebaseSession();

  useEffect(() => {
    if (
      startDate.toString() === lastStartDate &&
      endDate.toString() === lastEndDate
    )
      return console.log("Early return due to date", lastStartDate);

    // TODO() probably can remove casting to date?
    const q = query(
      collection(frontFirestore, "AmaceRuns"),
      where("date", ">=", formatFirebaseDate(new Date(startDate.getTime()))),
      where(
        "date",
        "<=",
        formatFirebaseDate(
          new Date(endDate.getTime() + 1 * 24 * 60 * 60 * 1000)
        )
      )
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const appRuns: QueryDocumentSnapshot<DocumentData>[] = [];
      let selDocIdx = 0;
      let idx = 0;
      querySnapshot.forEach((doc) => {
        // TODO detect doc id and set
        console.log("Doc id", doc.id);
        if (doc.id === qSelectedDocID) {
          selDocIdx = idx;
        }
        appRuns.push(doc);
        idx++;
      });
      setAppRunResults(appRuns);
      // console.log("AppRuns: ", appRuns);
      // Set a default doc
      // console.log("AppRuns: ", selectedDoc);
      if (!selectedDoc) {
        // console.log("Setting Selected Doc: ", appRuns[selDocIdx]);
        setSelectedDoc(appRuns[selDocIdx]);
      }
    });
    if (unSubRangeResultsRef.current) unSubRangeResultsRef.current();
    unSubRangeResultsRef.current = unsub;

    setInit(false);
    setLastStartDate(startDate.toString());
    setLastEndDate(endDate.toString());
  }, [init, startDate, endDate]);

  const [appResults, setAppResults] = useState<AmaceDBResult[]>([]);

  useEffect(() => {
    // const _appResults: AmaceDBResult[] = [];
    if (!selectedDoc) return;
    // console.log("Getting sub collection", selectedDoc);
    // eslint-disable-next-line
    const getSubCollection = async () => {
      // Get Doc on subcollection once, will not update as new apps are added.
      // const results = await getDocs(
      //   collection(frontFirestore, `AppRuns/${selectedDoc.id}/apps`)
      // );
      // results.forEach((appData) => {
      //   console.log("appData: ", appData.data());
      //   _appResults.push(appData.data() as AmaceDBResult);
      // });
      // processStats(_appResults);

      // Monitor collection as apps are added.
      const unSub = onSnapshot(
        collection(frontFirestore, `AmaceRuns/${selectedDoc.id}/apps`),
        (colSnap: QuerySnapshot<DocumentData>) => {
          const _appResults: AmaceDBResult[] = [];
          // console.log("Sub collection SS: ", colSnap);

          colSnap.docs.forEach((appData) => {
            // console.log("Pussing from SS: ", appData.data());
            _appResults.push(appData.data() as AmaceDBResult);
          });
          const stats = processStats(_appResults);
          setAppResults(_appResults);
          setTotalByStatus(stats);
        }
      );
      if (unSubRef.current) unSubRef.current();
      unSubRef.current = unSub;
    };

    getSubCollection().catch((err) => {
      console.log("Error getting subcolelction.", err);
    });
  }, [selectedDoc]);
  const TTID = "appsSript";

  const [appsScriptUrl, setAppsScriptUrl] = useState("");
  useEffect(() => {
    // "https://script.google.com/a/macros/google.com/s/AKfycbz78jkgL5avOwjzqUTfNLUY6k-ubfO5P7wpvRHFEvLfZIQfu1eAb7_LSxySoL1nDAkLIg/exec"

    if (appsScriptUrl === "") {
      getDoc(doc(frontFirestore, `AppsScript/url`))
        .then((doc) => {
          const urlData = doc.data() as AppsScriptUrlFB;
          console.log("Url from FB: ", urlData.url);
          setAppsScriptUrl(urlData.url);
        })
        .catch((err) =>
          console.log("Error getting Apps Script URL from Firebase: ", err)
        );
    }
  });

  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);
  const [devices, setDevices] = useState<string[]>([]);
  const [lastMsg, setLastMsg] = useState("");
  const [currentDevice, setCurrentDevice] = useState("");
  const RECONNECT_DELAY = 5000; // 5 seconds

  const connectToWebSocket = () => {
    console.log("connectToWebSocket", wsInstance);
    if (wsInstance) return;
    const ws = new WebSocket(wssURL);

    ws.onopen = () => {
      // Web Socket is connected, send data using send()
      console.log("Websocket onopen");
      ws.send("getdevicename");
      // startTimer();
    };

    ws.onerror = (err) => {
      console.log("Error: ", err);
    };

    ws.onmessage = (evt) => {
      const received_msg = evt.data as string;
      console.log("Message is received...", received_msg);

      if (received_msg.toString().startsWith("status:")) {
        cancelTimer();
      } else if (received_msg.toString().startsWith("getdevicename:")) {
        const dname = received_msg.toString().split(":")[1];
        console.log("Got a device name: ", dname);
        if (dname) {
          setDevices((prevDevices) => {
            if (!prevDevices.includes(dname)) {
              return [...prevDevices, dname];
            }
            return prevDevices; // Return previous state to prevent re-render
          });
        }
      }

      ws.onclose = (event) => {
        if (!event.wasClean) {
          console.log(
            `WebSocket connection lost. Reconnecting in ${
              RECONNECT_DELAY / 1000
            } seconds...`
          );
          setTimeout(connectToWebSocket, RECONNECT_DELAY);
        }
      };

      setLastMsg(received_msg);
    };

    setWsInstance(ws);
  };

  useEffect(() => {
    if (isBrowser && wsInstance === null) {
      connectToWebSocket();

      return () => {
        if (
          wsInstance &&
          (wsInstance as WebSocket).readyState !== WebSocket.CLOSED
        ) {
          (wsInstance as WebSocket).close();
        }
      };
    }
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimer = () => {
    // Set a timer for 5 seconds (or any desired duration)
    timerRef.current = setTimeout(() => {
      console.log("Timer expired because it was not canceled in time.");
      setLastMsg(
        "Make sure device in lab is turned on and program is listening..."
      );
    }, 5000);
    console.log("Timer started.");
  };
  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      console.log("Timer canceled.");
    }
  };

  console.log("Devices: ", devices);
  return (
    <>
      {/* TODO() move to new component.. */}
      <FullColumn height="h-[120px]">
        <div className=" flex h-[30px] justify-center">
          <Dropdown
            items={devices}
            onSelect={(item: string) => {
              console.log("Device selected: ", item);
              setCurrentDevice(item);
            }}
            currentItem={currentDevice}
          />
        </div>
        <div className="mt-[35px] flex flex-row items-center justify-center">
          {currentDevice.length > 0 ? (
            <>
              <p
                onClick={() => {
                  console.log("Starting run");
                  wsInstance?.send(`startrun_${currentDevice}`);
                }}
                className=" cursor-crosshair border border-emerald-500 pb-2 pl-4 pr-4 pt-2 hover:bg-emerald-400  focus:bg-rose-400"
              >
                Start Run
              </p>

              <p
                onClick={() => {
                  console.log("Querying status");
                  wsInstance?.send(`querystatus_${currentDevice}`);
                  startTimer();
                }}
                className=" cursor-crosshair border border-amber-300 pb-2 pl-4 pr-4 pt-2 hover:bg-amber-500  focus:bg-blue-400"
              >
                Query Status
              </p>

              <p
                onClick={() => {
                  console.log("Stopping run");
                  wsInstance?.send(`stoprun_${currentDevice}`);
                }}
                className=" cursor-crosshair border border-rose-500 pb-2 pl-4 pr-4 pt-2 hover:bg-rose-400  focus:bg-blue-400"
              >
                Stop Run
              </p>
              <p className=" border border-violet-500 pb-2 pl-4 pr-4 pt-2">
                last message: {lastMsg}
              </p>
            </>
          ) : (
            <></>
          )}
        </div>
      </FullColumn>
      <FullColumn height="h-[60px]">
        <div className="flex h-[60px] flex-row items-center justify-center">
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
          <Tooltip variant="dark" id={TTID} />
          <MdViewModule
            data-tooltip-id={TTID}
            data-tooltip-content="Create Google Sheet"
            className="h-[100%] cursor-pointer hover:bg-emerald-500"
            size={24}
            onClick={() => window.open(appsScriptUrl)}
          />
        </div>
      </FullColumn>

      <FullColumn height="h-[120px]">
        <div className="h-full w-full items-center justify-center bg-slate-800">
          {appRunResults.length ? (
            <AmaceRuns
              docs={appRunResults}
              height={0}
              selectedDoc={selectedDoc}
              onSelect={(sDoc) => setSelectedDoc(sDoc)}
            />
          ) : (
            <div className="flex h-[85px] flex-1 items-center justify-center">
              <p className="text-white">No App runs from selected date range</p>
            </div>
          )}
        </div>
      </FullColumn>

      <FullColumn height="h-[545px] mt-6">
        {selectedDoc && appResults.length > 0 ? (
          <AmaceResultTable
            height={400}
            key={`key__${selectedDoc.id}`}
            parentKey={`key__${selectedDoc.id}`}
            amaceResults={appResults}
            startDate={startDate.getTime()}
            endDate={endDate.getTime()}
            selectedDocID={selectedDoc?.id ?? ""}
            page="amace"
          />
        ) : (
          <div className="flex h-[400px] flex-1 items-center justify-center">
            <p className="text-white">Select an App Run Above</p>
          </div>
        )}
      </FullColumn>

      <FullColumn height="h-[500px]">
        <div>
          <h2 className="pl-10 text-center">Totals Bar Chart</h2>

          <div className="h-[420px]">
            {appResults.length > 0 ? (
              <BarChartPassFailTotals data={totalByStatus} />
            ) : (
              <div className="flex h-[400px] flex-1 items-center justify-center">
                <p className="text-white">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </FullColumn>
    </>
  );
};

export default AMACEPage;
