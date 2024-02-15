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
import FullColumn from "~/components/columns/FullColumn";
import CreateAppListModal from "~/components/modals/CreateAppListModal";
import EditAppListModal from "~/components/modals/EditAppListModal";
import Dropdown from "~/components/select/dropdown";
import { ping, pj, wssURL } from "~/components/shared";
import { MdInfoOutline, MdEditSquare, MdNoteAdd } from "react-icons/md";
import { frontFirestore } from "~/utils/frontFirestore";
import { Tooltip } from "react-tooltip";
import TwoThirdsColumn from "~/components/columns/TwoThirdsColumn";
import { AnsiUp } from "ansi_up";
import { useSession } from "next-auth/react";

// eslint-disable-next-line
const ansi: AnsiUp = new AnsiUp();
ansi.use_classes = true;

const isBrowser = typeof window !== "undefined";

const ReplaceDateTimePattern =
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z \[\d{2}:\d{2}:\d{2}\.\d+\]/;

const ReplaceDateTimePatternSecond =
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z/;

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

const isValidIPString = (val: string) => {
  return !val.split(" ").some((ip) => !isValidIP(ip));
};

// stores dutIPs under hostDevice key. Create new entry is key DNE.
const updateDeviceNameDutsLocalStorage = (
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

const getDeviceNameDutsLocalStorage = (hostDevice: string): string => {
  const currentData = localStorage.getItem("devices");

  // Parse the data if it exists, otherwise start with an empty object
  // eslint-disable-next-line
  const data = currentData ? JSON.parse(currentData) : {};

  // Update the data with the provided hostDevice and dutIPs
  // eslint-disable-next-line
  return data[hostDevice] ? data[hostDevice] : "";
};

const ManageHostDevicePanel: React.FC<{
  wsInstance: WebSocket | null;
  currentDevice: string;
  wssToken: string;
  selectedList: AppListEntry | null;
  startTimer(): void;
  duts: string;
  setDuts: React.Dispatch<React.SetStateAction<string>>;
}> = ({
  wsInstance,
  currentDevice,
  wssToken,
  selectedList,
  startTimer,
  setDuts,
  duts,
}) => {
  const startRun = () => {
    if (!selectedList?.listname) return alert("Select a list!");

    if (!duts || duts.length < "0.0.0.0".length)
      return alert("Enter ip address for target duts!");

    updateDeviceNameDutsLocalStorage(currentDevice, duts);

    wsInstance?.send(
      ping(
        `startrun_${currentDevice}`,
        { ...selectedList, devices: duts },
        wssToken
      )
    );
  };

  const queryStatus = () => {
    wsInstance?.send(ping(`querystatus_${currentDevice}`, {}, wssToken));
    startTimer();
  };

  const stopRun = () => {
    wsInstance?.send(ping(`stoprun_${currentDevice}`, {}, wssToken));
  };

  const updateHost = () => {
    wsInstance?.send(ping(`update_${currentDevice}`, {}, wssToken));
  };

  const onDUTsChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidIPString(ev.target?.value)) {
      setDuts(ev.target?.value);
    }
  };

  return (
    <>
      {currentDevice.length > 0 ? (
        <div className=" mt-[30px] flex flex-col items-center justify-center">
          <>
            <p className="mt-[5px]">
              {selectedList?.listname
                ? selectedList?.listname
                : "Select a list below"}
            </p>
            <div className=" flex flex-row items-center justify-center">
              <p
                onClick={startRun}
                className="cursor-crosshair border border-emerald-500 pb-2 pl-4 pr-4 pt-2 hover:bg-emerald-400  focus:bg-rose-400"
              >
                Start Run
              </p>

              <p
                onClick={queryStatus}
                className="cursor-crosshair border border-amber-300 pb-2 pl-4 pr-4 pt-2 hover:bg-amber-500  focus:bg-blue-400"
              >
                Query Status
              </p>

              <p
                onClick={stopRun}
                className=" cursor-crosshair border border-rose-500 pb-2 pl-4 pr-4 pt-2 hover:bg-rose-400  focus:bg-blue-400"
              >
                Stop Run
              </p>
              <p
                onClick={updateHost}
                className=" cursor-crosshair border border-rose-500 pb-2 pl-4 pr-4 pt-2 hover:bg-rose-400  focus:bg-blue-400"
              >
                Update
              </p>
            </div>

            <div className=" mt-12 flex w-full flex-row items-center justify-center">
              <p>Devices to test on: </p>{" "}
              <input
                className="ml-4 w-1/2 rounded-md bg-slate-500 p-2"
                value={duts}
                onChange={onDUTsChange}
              />
            </div>
          </>
        </div>
      ) : (
        <div className="h-[72px]"></div>
      )}
    </>
  );
};

const AppListsRow: React.FC<{
  appLists: AppListEntry[];
  selectedList: AppListEntry | null;
  setSelectedList: React.Dispatch<React.SetStateAction<AppListEntry | null>>;
}> = ({ appLists, selectedList, setSelectedList }) => {
  const [showListModal, setShowListModal] = useState(false);

  return (
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
                flex h-full w-full cursor-pointer flex-row content-center
                justify-between border-b border-fuchsia-500
                pb-4 pl-4 pt-4  align-middle  hover:bg-slate-700
                md:text-xs lg:text-sm
                ${
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
      <EditAppListModal
        listProp={selectedList}
        key={`Editmodal_${selectedList?.listname ?? "nolist"}`}
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
      />
    </FullColumn>
  );
};
const CreateAppListRow: React.FC<{ currentNames: string[] }> = ({
  currentNames,
}) => {
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const TTID = "AddListTooltipID";

  return (
    <>
      <div className="mb-2 mr-8 flex flex-row justify-end">
        <div
          className="w-[35px] "
          data-tooltip-id={TTID}
          data-tooltip-content="Add App List"
        >
          <Tooltip variant="info" id={TTID} />
          <MdNoteAdd
            className="mb-1 mr-4 mt-1 w-[50px] cursor-pointer text-slate-50 hover:text-slate-700"
            size={24}
            onClick={() => setShowCreateListModal(true)}
          />
        </div>
      </div>

      <CreateAppListModal
        key={"create modal"}
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        currentNames={currentNames}
      />
    </>
  );
};

const ManageInfoTip: React.FC = () => {
  const InfoIconTTID = "InfoTooltipID";
  return (
    <div className="flex w-6 w-full justify-end">
      <div className="flex w-6 " data-tooltip-id={InfoIconTTID}>
        <MdInfoOutline className="cursor-pointer" size={24} />
        <Tooltip variant="dark" id={InfoIconTTID}>
          <div>
            <strong>App Lists</strong>
            <br />
            <strong>Create List:</strong> Add a new list of apps to test. (Copy
            &#38; paste from sheets, to ensure formatting.)
            <br />
            <strong>Select List:</strong> Click list to select. This will be the
            list of apps tested when presing &#39;Start Run&#39;
            <br />
            <hr />
            <br />
            <strong>Start Run:</strong> Select device, then an App List and
            press &#39;Start Run&#39; [new run wont start if a run is in
            progress.]
            <br />
            <strong>Query:</strong> Gets current status (running or stopped)
            <br />
            <strong>Stop:</strong> Press &#39;Stop Run&#39; (cancels current
            run)
            <br />
            <strong>Update:</strong> Press Update and then Stop. (Updates Host
            device from Git repo)
            <br />
            <br />
            <hr />
            <br />
            <strong>View Runs:</strong> View each run in Amace-E.
            <br />
            <strong>Top 250:</strong> View all failed apps from Top 250 O4C apps
            <br />
            <strong>Broken Apps:</strong> View all failed apps from all other
            lists tested. (A collection of broken apps grouped monthly.)
            <br />
            <br />
          </div>
        </Tooltip>
      </div>
    </div>
  );
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
    const ws = new WebSocket(wssURL);
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
