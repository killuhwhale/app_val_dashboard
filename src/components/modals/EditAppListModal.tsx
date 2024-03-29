import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";
import { api } from "~/utils/api";

interface EditAppListModalProps {
  isOpen: boolean;
  onClose(): void;
  listProp: AppListEntry | null;
}

function unEscapeAppList(escapedList: string): string {
  return escapedList.replaceAll("\\n", "\n").replaceAll("\\t", "\t");
}

export function getAppCount(list: AppListEntry | null) {
  if (!list) return 0;

  const text = list["apps"];
  let numApps = 0;
  if (text.indexOf("\\n") > -1) {
    numApps = text.split("\\n").length;
  } else {
    numApps = text.split("\n").length;
  }
  return numApps;
}

const EditAppListModal: React.FC<EditAppListModalProps> = ({
  isOpen,
  onClose,
  listProp,
}) => {
  // Makes copy of current list
  const [list, setList] = useState<AppListEntry | null>(
    listProp ? { ...listProp } : null
  );

  // Allow updates to reflect
  useEffect(() => {
    console.log("useEffect props: ", listProp);
    if (
      listProp?.listname !== list?.listname &&
      listProp !== null &&
      listProp !== undefined
    ) {
      const listCopy = { ...listProp };
      setList(listCopy);
    }
  }, [listProp]);

  // Change local copy
  const onChange = (text: string) => {
    const listCopy: AppListEntry = { ...list } as AppListEntry;
    listCopy["apps"] = text;
    setList(listCopy);
  };

  const onChangeDriveURL = (text: string) => {
    const cList: AppListEntry = { ...list } as AppListEntry;
    cList["driveURL"] = text;
    setList(cList);
  };

  const updateListTRPC = api.example.updateAppList.useMutation();

  // Use local copy to update firebase
  const updateList = () => {
    if (list && list.listname) {
      if (!list.driveURL && !list.apps) {
        return alert("Entry must have either Folder ID or List of apps!");
      }
      try {
        updateListTRPC.mutate(list);
      } catch (err) {
        alert(`Failed to create app list: ${(err as string).toString()}`);
      }
    }
  };

  useEffect(() => {
    if (updateListTRPC.data !== undefined) {
      if (!updateListTRPC.data.updated) {
        return alert("Failed to update list: ");
      }
      onClose();
    }
  }, [updateListTRPC.data]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-gray-900 opacity-70"
            onClick={onClose}
          ></div>
          <div className="z-50 flex h-[475px] w-[600px] flex-col justify-between rounded-md bg-white p-4">
            <h2 className="mb-2 justify-center text-center  text-lg font-bold text-black">
              App Val
            </h2>
            <h3 className="text-center font-bold text-black">
              Update App List
            </h3>

            {list !== null && list !== undefined ? (
              <div className="flex flex-col justify-center">
                <p className="font-medium text-black">
                  Editing: <span className="font-light">{list.listname}</span>
                </p>
                {list.playstore ? (
                  <></>
                ) : (
                  <p className="font-medium text-black">
                    Folder:{" "}
                    <input
                      className="w-full  bg-slate-300 font-light"
                      placeholder="Drive URL"
                      value={list.driveURL}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        onChangeDriveURL(event.target.value)
                      }
                    />
                  </p>
                )}

                <p className="pb-1 pt-4 font-bold text-black">
                  Apps ({getAppCount(list)})
                </p>

                <textarea
                  className="bg-slate-300 pl-1 text-emerald-700"
                  rows={9}
                  cols={80}
                  placeholder="Apps"
                  value={unEscapeAppList(list.apps)}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    onChange(event.target.value)
                  }
                />
              </div>
            ) : (
              <p>Select list to edit</p>
            )}

            <div className="flex w-full justify-around">
              <button
                onClick={onClose}
                className="w-1/3 rounded  bg-slate-600 px-4 py-2 font-bold text-white hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => updateList()}
                className="w-1/3 rounded  bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditAppListModal;
