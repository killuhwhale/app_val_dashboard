import { MdNoteAdd } from "react-icons/md";
import CreateAppListModal from "../modals/CreateAppListModal";
import { Tooltip } from "react-tooltip";
import { useState } from "react";

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

export default CreateAppListRow;
