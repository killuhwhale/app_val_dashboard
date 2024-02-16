import { MdInfoOutline } from "react-icons/md";
import { Tooltip } from "react-tooltip";

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
export default ManageInfoTip;
