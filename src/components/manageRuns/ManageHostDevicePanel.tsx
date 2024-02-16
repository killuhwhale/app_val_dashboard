import {
  isValidIPString,
  updateDeviceNameDutsLocalStorage,
} from "~/pages/manageRuns";
import { ping } from "../shared";

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

export default ManageHostDevicePanel;
