type TooltipPayload = {
  value?: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (
    active &&
    payload &&
    payload.length &&
    payload[0] &&
    payload[0].value &&
    label
  ) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

// Helps tally up app count to display in graph
const getAmaceReasonStatObj = () => {
  return {
    Fail: 0,
    PRICE: 0,
    OLDVERSION: 0,
    INSTALLFAIL: 0,
    DEVICENOTCOMPAT: 0,
    COUNTRYNA: 0,
    O4C: 0,
    O4CFullScreenOnly: 0,
    IsFSToAmacE: 0,
    IsLockedPAmacE: 0,
    IsLockedTAmacE: 0,
    IsAmacE: 0,
    PWA: 0,
  };
};

// Helps tally up app count to display in graph
const getReasonStatObj = () => {
  return {
    LOGGED_IN_FACEBOOK: 0,
    LOGGED_IN_GOOLE: 0,
    LOGGED_IN_EMAIL: 0,
    PASS: 0,
    FAIL: 0,
    CRASH_WIN_DEATH: 0,
    CRASH_FORCE_RM_ACT_RECORD: 0,
    CRASH_ANR: 0,
    CRASH_FDEBUG_CRASH: 0,
    CRASH_FATAL_EXCEPTION: 0,
    NEEDS_PRICE: 0,
    INVALID: 0,
    DID_NOT_OPEN: 0,
  } as AppStatus;
};

export { CustomTooltip, getReasonStatObj, getAmaceReasonStatObj };
