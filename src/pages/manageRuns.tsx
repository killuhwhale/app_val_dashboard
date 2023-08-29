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
import React, { useEffect, useRef, useState } from "react";
import FullColumn from "~/components/columns/FullColumn";
import CreateAppListModal from "~/components/modals/CreateAppListModal";
import EditAppListModal from "~/components/modals/EditAppListModal";
import Dropdown from "~/components/select/dropdown";
import { ping, pj, wssURL } from "~/components/shared";
import { MdEditSquare, MdNoteAdd } from "react-icons/md";
import { frontFirestore, useFirebaseSession } from "~/utils/frontFirestore";
import { Tooltip } from "react-tooltip";

export const isBrowser = typeof window !== "undefined";
const ManageRunPage: React.FC = () => {
  const sesh = useFirebaseSession();
  const router = useRouter();
  const { query: _query } = router;
  const [init, setInit] = useState(true);
  const unSubRef = useRef<Unsubscribe>();
  const [appRunResults, setAppRunResults] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);

  const [appLists, setAppLists] = useState<AppListEntry[]>([]);
  const [selectedList, setSelectedList] = useState<AppListEntry | null>(null);

  // Access individual query parameters
  useEffect(() => {
    const unSub = onSnapshot(
      collection(frontFirestore, `AppLists`),
      (colSnap: QuerySnapshot<DocumentData>) => {
        const _appLists: AppListEntry[] = [];
        // console.log("Sub collection SS: ", colSnap);

        colSnap.docs.forEach((appData) => {
          // console.log("Pussing from SS: ", appData.data());
          _appLists.push(appData.data() as AppListEntry);
        });
        setAppLists(_appLists);
      }
    );
    if (unSubRef.current) unSubRef.current();
    unSubRef.current = unSub;
  }, []);

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
      const thingToSend = ping("getdevicename", {});
      console.log("This to send!!! ", thingToSend);
      ws.send(thingToSend);
      // startTimer();
    };

    ws.onerror = (err) => {
      console.log("Error: ", err);
    };

    ws.onmessage = (evt) => {
      console.log("raw message recv'd: ", evt.data);
      let mping;
      try {
        mping = pj(evt.data as string);
      } catch (err) {
        return;
      }
      const received_msg = mping.msg;

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
  const [showListModal, setShowListModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const TTID = "AddListTooltipID";
  return (
    <>
      <FullColumn height="h-[135px]">
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
        <div className=" mt-[30px] flex flex-col items-center justify-center">
          {currentDevice.length > 0 ? (
            <>
              <p className="mt-[5px]">
                {selectedList?.listname
                  ? selectedList?.listname
                  : "Select a list below"}
              </p>
              <div className=" flex flex-row items-center justify-center">
                <p
                  onClick={() => {
                    if (!selectedList?.listname) return alert("Select a list!");
                    console.log("Starting run using list: ", selectedList);
                    wsInstance?.send(
                      ping(`startrun_${currentDevice}`, selectedList)
                    );
                  }}
                  className=" cursor-crosshair border border-emerald-500 pb-2 pl-4 pr-4 pt-2 hover:bg-emerald-400  focus:bg-rose-400"
                >
                  Start Run
                </p>

                <p
                  onClick={() => {
                    console.log("Querying status");
                    wsInstance?.send(ping(`querystatus_${currentDevice}`, {}));
                    startTimer();
                  }}
                  className=" cursor-crosshair border border-amber-300 pb-2 pl-4 pr-4 pt-2 hover:bg-amber-500  focus:bg-blue-400"
                >
                  Query Status
                </p>

                <p
                  onClick={() => {
                    console.log("Stopping run");
                    wsInstance?.send(ping(`stoprun_${currentDevice}`, {}));
                  }}
                  className=" cursor-crosshair border border-rose-500 pb-2 pl-4 pr-4 pt-2 hover:bg-rose-400  focus:bg-blue-400"
                >
                  Stop Run
                </p>
                <p className=" border border-violet-500 pb-2 pl-4 pr-4 pt-2">
                  last message: {lastMsg}
                </p>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </FullColumn>

      <div className="mb-2 mr-8 flex flex-row justify-end">
        <div
          className="w-[35px] "
          data-tooltip-id={TTID}
          data-tooltip-content="Add App List"
        >
          <Tooltip variant="dark" id={TTID} />
          <MdNoteAdd
            className="mb-1 mr-4 mt-1 w-[50px] cursor-pointer text-slate-50 hover:text-slate-700"
            size={24}
            onClick={() => setShowCreateListModal(true)}
          />
        </div>
      </div>

      <EditAppListModal
        listProp={selectedList}
        key={`Editmodal_${selectedList?.listname ?? "nolist"}`}
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
      />

      <CreateAppListModal
        key={"create modal"}
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        currentNames={appLists.map((list) =>
          list.listname.toLocaleLowerCase().replaceAll(" ", "")
        )}
      />

      <FullColumn height="h-[400px]">
        {appLists && appLists.length > 0 ? (
          <div className="m-1">
            <p className="font-light">App Lists</p>

            <div className="mt-2 max-h-[350px] overflow-y-auto  bg-slate-800">
              {appLists.map((list: AppListEntry, i) => {
                return (
                  <div
                    key={`${list.listname}_${i}`}
                    className={`
                        flex h-full w-full cursor-pointer flex-row content-center  justify-between border-b border-fuchsia-500
                      pb-4 pl-4 pt-4  align-middle  hover:bg-slate-700 ${
                        selectedList?.listname === list.listname
                          ? "bg-fuchsia-500 hover:bg-fuchsia-300"
                          : ""
                      }`}
                    onClick={() => {
                      setSelectedList(list);
                    }}
                  >
                    <p className={`my-auto text-center`}>
                      {list.listname}
                      {list.playstore
                        ? " [playstore]"
                        : ` - (Folder: ${list.driveURL}) [pythonstore]`}
                    </p>
                    <MdEditSquare
                      className="mb-1 mr-4 mt-1 w-[50px] "
                      size={18}
                      onClick={() => setShowListModal(true)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </FullColumn>
    </>
  );
};

export default ManageRunPage;
