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
    LaunchFail: 0,
    Crashed: 0,
    Needspurchase: 0,
    Appisold: 0,
    Failedtoinstall: 0,
    TooManyAttempts: 0,
    Devicenotcompatible: 0,
    Chromebooknotcompatible: 0,
    CountryNA: 0,
    O4C: 0,
    O4CFSonly: 0,
    FSAmace: 0,
    Phoneonly: 0,
    Tabletonly: 0,
    Amace: 0,
    PWA: 0,
  };
};

// Helps tally up app count to display in graph
const getReasonStatObj = () => {
  return {
    PLAYSTORE_FAIL: 0,
    CRASH_WIN_DEATH: 0,
    CRASH_FORCE_RM_ACT_RECORD: 0,
    CRASH_ANR: 0,
    CRASH_FDEBUG_CRASH: 0,
    CRASH_FATAL_EXCEPTION: 0,
    FAILED_TO_LAUNCH: 0,
    FAILED_TO_INSTALL: 0,
    NEEDS_PRICE: 0,
    DEVICE_NONCOMPAT: 0,
    INVALID: 0,
    APP_OLD: 0,
    COUNTRY_NA: 0,
    FAIL: 0,
    PASS: 0,
    LOGGED_IN_GOOGLE: 0,
    LOGGED_IN_FB: 0,
    LOGGED_IN_EMAIL: 0,
    INIT: 0,
  } as AppStatus;
};

export { CustomTooltip, getAmaceReasonStatObj, getReasonStatObj };
