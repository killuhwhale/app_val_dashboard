import { MdEditSquare } from "react-icons/md";
import FullColumn from "../columns/FullColumn";

import { useState } from "react";
import EditAppListModal from "../modals/EditAppListModal";

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

export default AppListsRow;
