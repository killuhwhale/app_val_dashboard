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

export { CustomTooltip };
