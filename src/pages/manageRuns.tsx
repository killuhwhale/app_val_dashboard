"use client";

import { Unsubscribe } from "firebase/auth";
import {
  DocumentData,
  QuerySnapshot,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Dropdown from "~/components/select/dropdown";
import { ping, pj, wssURL } from "~/components/shared";
import { frontFirestore } from "~/utils/frontFirestore";
import TwoThirdsColumn from "~/components/columns/TwoThirdsColumn";
import { AnsiUp } from "ansi_up";
import { useSession } from "next-auth/react";
import ManageHostDevicePanel from "~/components/manageRuns/ManageHostDevicePanel";
import AppListsRow from "~/components/manageRuns/AppListsRow";
import CreateAppListRow from "~/components/manageRuns/CreateAppListRow";
import ManageInfoTip from "~/components/manageRuns/ManageInfoTip";
import CONFIG from "../../config.json";

// eslint-disable-next-line
const ansi: AnsiUp = new AnsiUp();
ansi.use_classes = true;

const isBrowser = typeof window !== "undefined";

const ReplaceDateTimePattern =
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z \[\d{2}:\d{2}:\d{2}\.\d+\]/;

const ReplaceDateTimePatternSecond =
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z/;

const getDeviceNameDutsLocalStorage = (hostDevice: string): string => {
  const currentData = localStorage.getItem("devices");

  // Parse the data if it exists, otherwise start with an empty object
  // eslint-disable-next-line
  const data = currentData ? JSON.parse(currentData) : {};

  // Update the data with the provided hostDevice and dutIPs
  // eslint-disable-next-line
  return data[hostDevice] ? data[hostDevice] : "";
};

const isValidIP = (ip: string) => {
  const ipPieces = ip.split(".");
  if (ipPieces.length > 5) {
    return false;
  }

  if (ipPieces.length === 5 && ip.endsWith(".")) {
    return false;
  }

  return !ipPieces.some((piece: string) => {
    return piece.length > 3 || !/^\d*$/.test(piece);
  });
};

export const isValidIPString = (val: string) => {
  return !val.split(" ").some((ip) => !isValidIP(ip));
};

export const updateDeviceNameDutsLocalStorage = (
  hostDevice: string,
  dutIPs: string
) => {
  const currentData = localStorage.getItem("devices");

  // Parse the data if it exists, otherwise start with an empty object
  // eslint-disable-next-line
  const data = currentData ? JSON.parse(currentData) : {};

  // Update the data with the provided hostDevice and dutIPs
  // eslint-disable-next-line
  data[hostDevice] = dutIPs;

  // Store the updated data back to localStorage
  localStorage.setItem("devices", JSON.stringify(data));
};

const ManageRunPage: React.FC = () => {
  const router = useRouter();
  const { query: _query } = router;
  const unSubRef = useRef<Unsubscribe>();

  const [appLists, setAppLists] = useState<AppListEntry[]>([]);
  const [selectedList, setSelectedList] = useState<AppListEntry | null>(null);

  useEffect(() => {
    const unSub = onSnapshot(
      collection(frontFirestore, `AppLists`),
      (colSnap: QuerySnapshot<DocumentData>) => {
        const _appLists: AppListEntry[] = [];
        colSnap.docs.forEach((appData) => {
          _appLists.push(appData.data() as AppListEntry);
        });
        setAppLists(_appLists);
      }
    );
    if (unSubRef.current) unSubRef.current();
    unSubRef.current = unSub;
  }, []);

  const { data: session } = useSession();
  const wssToken = session?.user.wssToken ?? "";
  const RECONNECT_DELAY = 5000; // 5 seconds
  const MSG_LIMIT = 100;
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);
  const [devices, setDevices] = useState<string[]>([]);
  const [lastMsg, setLastMsg] = useState("");
  const [lastMsgs, setLastMsgs] = useState<string[]>([]);
  const [currentDevice, setCurrentDevice] = useState("");
  const [duts, setDuts] = useState("");

  const connectToWebSocket = () => {
    if (wsInstance) return;
    console.log("CONFIG.wssURL: ", CONFIG.wssURL);
    const ws = new WebSocket(CONFIG.wssURL);
    setWsInstance(ws);
  };

  useEffect(() => {
    if (isBrowser) {
      if (wsInstance === null) {
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

      wsInstance.onopen = () => {
        // Web Socket is connected, send data using send()
        wsInstance.send(ping("getdevicename", {}, wssToken));
      };

      wsInstance.onerror = (err) => {
        console.error("Error: ", err);
        if (
          (wsInstance && wsInstance.readyState !== WebSocket.OPEN) ||
          wsInstance.readyState !== WebSocket.CLOSING
        ) {
          wsInstance.close();
          setWsInstance(null);
        }
      };

      wsInstance.onmessage = (evt) => {
        let mping;
        try {
          mping = pj(evt.data as string);
          const received_msg = mping.msg.toString();

          if (received_msg.startsWith("status:")) {
            cancelTimer();
          } else if (received_msg.startsWith("getdevicename:")) {
            const dname = received_msg.split(":")[1];
            if (dname) {
              setDevices((prevDevices) => {
                if (!prevDevices.includes(dname)) {
                  return [...prevDevices, dname];
                }
                return prevDevices; // Return previous state to prevent re-render
              });
            }
          }

          setLastMsgs((prevMsgs) => {
            if (prevMsgs.length > MSG_LIMIT) prevMsgs.splice(0, 1);
            const cleanedMsg = received_msg
              .replaceAll(`b'`, "")
              .replaceAll(`'`, "")
              .replaceAll(`b"`, "")
              .replaceAll(`"`, "")
              .replaceAll(`\\n`, "")
              .replaceAll("progress:", "")
              .replace(ReplaceDateTimePattern, "")
              .replace(ReplaceDateTimePatternSecond, "");
            // eslint-disable-next-line

            const html = ansi.ansi_to_html(cleanedMsg);

            setLastMsg([...prevMsgs, html].join(" ")); // Update formatted string to display
            // eslint-disable-next-line
            return [...prevMsgs, `<p>${html}</p>`];
          }); // Update array
        } catch (err) {
          return console.error("onmessage err: ", err);
        }
      };

      wsInstance.onclose = (event) => {
        if (!event.wasClean) {
          console.log(
            `WebSocket connection lost. Reconnecting in ${
              RECONNECT_DELAY / 1000
            } seconds...`
          );
          setWsInstance(null);
        }
      };
    }
  }, [wsInstance]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      setLastMsg(
        "Make sure device in lab is turned on and program is listening..."
      );
    }, 5000);
  };

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line
    console.log("lastMsgs: ", lastMsgs);
    if (progressRef.current) {
      progressRef.current.innerHTML = lastMsg;
    }
  }, [lastMsg]);

  useEffect(() => {
    if (currentDevice) {
      setDuts(getDeviceNameDutsLocalStorage(currentDevice));
    }
  }, [currentDevice]);

  return (
    <TwoThirdsColumn height="min-h-[535px] h-[90vh]">
      {/* left Side */}
      <>
        <Dropdown
          items={devices}
          onSelect={(item: string) => {
            setCurrentDevice(item);
          }}
          currentItem={currentDevice}
        />
        <ManageInfoTip />

        <ManageHostDevicePanel
          currentDevice={currentDevice}
          selectedList={selectedList}
          startTimer={startTimer}
          wsInstance={wsInstance}
          wssToken={wssToken}
          setDuts={setDuts}
          duts={duts}
        />

        <CreateAppListRow
          currentNames={appLists.map((list) =>
            list.listname.toLocaleLowerCase().replaceAll(" ", "")
          )}
        />
        <AppListsRow
          appLists={appLists}
          selectedList={selectedList}
          setSelectedList={setSelectedList}
        />
      </>

      {/* Right Side Side */}
      <div className="overflow-y p-4" ref={progressRef} />
    </TwoThirdsColumn>
  );
};

export default ManageRunPage;
