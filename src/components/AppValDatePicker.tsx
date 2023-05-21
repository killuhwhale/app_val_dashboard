import { useState } from "react";
import Calendar from "react-calendar";
import { Value } from "react-calendar/dist/cjs/shared/types";
import { formatDateToString } from "~/pages";

const DatePicker: React.FC<{
  startDay: Date;
  endDay: Date;
  onStartSelect(date: string): void;
  onEndSelect(date: string): void;
}> = (props) => {
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  return (
    <div className="z-20 flex h-full w-full flex-col  items-center  bg-slate-800">
      <div className="flex h-full items-center">
        <div className="relative w-1/2 max-w-sm pr-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            readOnly
            onClick={() => setShowStartDate(!showStartDate)}
            className="block h-[40px] w-[300px] rounded-lg border border-gray-300 bg-slate-900 p-2.5 pl-10 text-sm text-white focus:border-blue-500 focus:ring-blue-500 "
            placeholder="Select date"
            value={props.startDay.toString().split(" ").slice(0, 4).join(" ")}
          />
        </div>
        <p>to</p>
        <div className=" relative w-1/2 max-w-sm pl-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-9">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            readOnly
            onClick={() => setShowEndDate(!showEndDate)}
            className=" block h-[40px] w-[300px] rounded-lg border border-gray-300 bg-slate-900 p-2.5 pl-10 text-sm text-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Select date"
            value={props.endDay.toString().split(" ").slice(0, 4).join(" ")}
          />
        </div>
      </div>

      <div className="absolute mt-14 flex">
        <div className="mr-6 w-[300px] ">
          <Calendar
            className={`${
              !showStartDate ? "hidden" : ""
            } rounded-2xl bg-slate-900 p-2 text-white`}
            calendarType="US"
            key="StartDateSelect"
            value={props.startDay}
            tileClassName={({ date, view }) => {
              if (formatDateToString(date) == formatDateToString(new Date())) {
                return "bg-slate-400 text-black rounded-xl";
              } else if (
                formatDateToString(date) == formatDateToString(props.startDay)
              ) {
                return "bg-slate-100 text-black rounded-xl";
              }
            }}
            onChange={(value: Value) => {
              if (!value || value >= props.endDay) return;
              setShowStartDate(false);
              props.onStartSelect(value?.toString() ?? "");
            }}
          />
        </div>
        <div className="ml-6 w-[300px]">
          <Calendar
            calendarType="US"
            className={`pl-5 ${
              !showEndDate ? "hidden" : ""
            } rounded-2xl bg-slate-900 p-2 text-white`}
            key="EndDateSelect"
            value={props.endDay}
            tileClassName={({ date, view }) => {
              if (formatDateToString(date) == formatDateToString(new Date())) {
                return "bg-slate-400 text-black rounded-xl";
              } else if (
                formatDateToString(date) == formatDateToString(props.endDay)
              ) {
                return "bg-slate-100 text-black rounded-xl";
              }
            }}
            onChange={(value: Value) => {
              if (!value || value <= props.startDay) return;
              setShowEndDate(false);
              props.onEndSelect(value?.toString() ?? "");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
