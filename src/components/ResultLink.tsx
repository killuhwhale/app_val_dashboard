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
interface ResultLink {
  startDate: number;
  endDate: number;
  selectedDocID: string;
  page: string;
}

const ResultLink: React.FC<ResultLink> = ({
  page,
  endDate,
  selectedDocID,
  startDate,
}) => {
  const [init, setInit] = useState(true);
  const [toggle, setToggle] = useState(false);
  const cbID = "cbID";

  useEffect(() => {
    console.log("Link init: ", init);
    if (init) {
      setInit(false);
      return;
    }
    console.log("Linking: ", selectedDocID);

    const setClip = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.log("Error copying text to clipboard: ", err);
      }
    };

    setClip(
      `https://${window.location.hostname}/${page}?s_d=${startDate}&e_d=${endDate}&id=${selectedDocID}`
    )
      .then((res) => console.log(""))
      .catch((err) => console.log("Error result link cb: ", err));
  }, [toggle]);

  // const link = `http://localhost:3000/${page}/s_d=${startDate}&e_d=${endDate}&id=${selectedDocID}`

  return (
    <>
      <p
        className="cursor-pointer"
        onClick={() => setToggle(!toggle)}
        data-tooltip-id={cbID}
        data-tooltip-content="Link table"
      >
        LINK
      </p>
      <Tooltip variant="dark" id={cbID} />
    </>
  );
};

export default ResultLink;
