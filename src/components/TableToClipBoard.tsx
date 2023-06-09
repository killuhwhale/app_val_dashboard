import React, {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { MdArrowDownward, MdArrowUpward, MdContentCopy } from "react-icons/md";
import { debounce, filter, filterOptions } from "~/utils/algos";
import ViewHistoryModal from "./modals/ViewHistoryModal";
import ViewLogsModal from "./modals/ViewLogsModal";
import { get } from "http";
import { colors } from "~/utils/dateUtils";
import { Tooltip } from "react-tooltip";

// Creates a link and copies to users clipboard.
interface TableToClipBoardProps {
  tootlTipText: string;
  generateText(): string;
}

const TableToClipBoard: React.FC<TableToClipBoardProps> = ({
  generateText,
  tootlTipText,
}) => {
  const [init, setInit] = useState(true);
  const [clipboardData, setClipboardData] = useState(false);
  const clipBoardTTID = "ClipboardTooltipID";

  useEffect(() => {
    if (init) return setInit(false);

    console.log("Adding to clipboard!");

    const setClip = async (text: string) => {
      console.log("Seting text to CB: ", text);
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.log("Error copying text to clipboard: ", err);
      }
    };

    setClip(generateText())
      .then((res) => console.log(""))
      .catch((err) => console.log("Error table to cb: ", err));
  }, [clipboardData]);

  return (
    <>
      <div
        className="flex w-6"
        data-tooltip-id={clipBoardTTID}
        data-tooltip-content={tootlTipText}
      >
        <MdContentCopy
          className="cursor-pointer"
          onClick={() => setClipboardData(!clipboardData)}
          size={24}
        />
      </div>
      <Tooltip variant="dark" id={clipBoardTTID} />
    </>
  );
};

export default TableToClipBoard;
