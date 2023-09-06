import React, { useEffect, useState } from "react";

import { MdDeleteForever } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import ActionCancelModal from "../modals/ActionCancelModal";
import { api } from "~/utils/api";

// Creates a link and copies to users clipboard.
interface DeleteBrokenAppRunsProps {
  docID: string;
  path: string;
}

const DeleteBrokenAppRuns: React.FC<DeleteBrokenAppRunsProps> = ({
  docID,
  path,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* Deletes data from firestore collection */
  const delCol = api.example.deleteBrokenAppsCollection.useMutation();
  const documentPath = `${path}/${docID}`;
  // Ran when mutation results changes, aka when user clicks delete and backend returns after deleteing collection which then deletes media
  useEffect(() => {
    const res = delCol.data?.deleted;
    if (res === undefined) return;

    if (res) {
      setShowDeleteModal(false);
    } else {
      alert("Failed to remove data from AmaceRun");
    }
  }, [delCol.data?.deleted]);

  const TTID = "DeleteTooltipID";

  const deleteDocFromFB = () => {
    if (docID === "") return;
    console.log("Deleting: ", docID);

    try {
      // Remove data to delete with subcollection.
      delCol.mutate({ document: documentPath });
    } catch (err: any) {
      console.log("Error deleteing doc from firebase", err);
      alert(`Error deleteing doc from firebase`);
    }
  };

  return (
    <>
      <div data-tooltip-id={TTID} data-tooltip-content="Delete Doc">
        <MdDeleteForever
          className="cursor-pointer text-red-700"
          onClick={() => setShowDeleteModal(true)}
          size={24}
        />
        <Tooltip variant="dark" id={TTID} />
        <ActionCancelModal
          isOpen={showDeleteModal}
          onAction={() => {
            deleteDocFromFB();
          }}
          message={`Are you sure you want to remove ${documentPath}?`}
          onClose={() => setShowDeleteModal(false)}
          note="Permanent"
          key="deleteKey"
        />
      </div>
    </>
  );
};

export default DeleteBrokenAppRuns;
