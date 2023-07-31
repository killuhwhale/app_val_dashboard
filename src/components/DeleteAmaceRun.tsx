import React, {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { MdDeleteForever } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import ActionCancelModal from "./modals/ActionCancelModal";
import { frontFirestore } from "~/utils/frontFirestore";
import { ref, deleteObject, listAll, StorageReference } from "firebase/storage";
import { frontStorage } from "~/utils/frontFirestore";
import { api } from "~/utils/api";

// Creates a link and copies to users clipboard.
interface DeleteDocProps {
  docID: string;
}

async function deleteCrawl(storageRef: StorageReference) {
  /* Deletes media from storage */
  const res = await listAll(storageRef);
  const promises: Promise<void>[] = [];
  const promisesCrawl: Promise<void>[] = [];

  res.prefixes.forEach((folderRef) => {
    // All the prefixes under listRef.
    // You may call listAll() recursively on them.
    promisesCrawl.push(deleteCrawl(folderRef));
  });
  await Promise.all(promisesCrawl);

  res.items.forEach((itemRef) => {
    console.log("Pusing for delete: ", itemRef.fullPath);
    promises.push(deleteObject(itemRef));
  });
  await Promise.all(promises);
}

const DeleteAmaceRun: React.FC<DeleteDocProps> = ({ docID }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* Deletes data from firestore collection */
  const delCol = api.example.deleteCollection.useMutation();

  // Ran when mutation results changes, aka when user clicks delete and backend returns after deleteing collection which then deletes media
  useEffect(() => {
    const res = delCol.data?.deleted;
    if (!res) return;

    // Mutation will trigger backend to delete all data from collection then deleteCrawl will de
    const doDeleteMedia = async () => {
      try {
        console.log("Delete res: ", res);
        if (res !== "") {
          // Remove media....
          const storageRef = ref(frontStorage, `/amaceRuns/${docID}`);
          await deleteCrawl(storageRef);
          setShowDeleteModal(false);
        } else {
          alert(`Failed to delete media for: ${docID}`);
        }
      } catch (err) {
        alert(err);
      }
    };

    doDeleteMedia()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }, [delCol.data?.deleted]);

  const TTID = "DeleteTooltipID";

  const deleteDocFromFB = () => {
    if (docID === "") return;
    console.log("Deleting: ", docID);

    try {
      // Remove data to delete with subcollection.
      delCol.mutate({ docID: docID });

      // Doesnt delete sub collection "apps"
      // await deleteDoc(doc(frontFirestore, `AmaceRuns/${docID}`));
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
          message={`Are you sure you want to remove ${docID}?`}
          onClose={() => setShowDeleteModal(false)}
          note="Permanent"
          key="deleteKey"
        />
      </div>
    </>
  );
};

export default DeleteAmaceRun;
