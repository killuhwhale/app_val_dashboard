import { useState } from "react";

interface ViewHistoryModalProps {
  isOpen: boolean;
  onClose(): void;
  history: string;
  appName: string;
}

type HistoryStep = {
  msg: string;
  img: string;
};

const ViewHistoryModal: React.FC<ViewHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  appName,
}) => {
  const hist = JSON.parse(history) as HistoryStep[];
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div
            className="fixed inset-0 bg-gray-900 opacity-70 "
            onClick={onClose}
          ></div>
          <div className="z-50 flex h-[80vh] w-full flex-col justify-between rounded-md bg-slate-700  p-4">
            <h2 className="mb-2 justify-center text-center  text-lg font-bold">
              {appName} History
            </h2>
            <div className="mb-8 mt-8 h-[75vh] overflow-y-auto">
              {hist.map((step: HistoryStep) => {
                return (
                  <div
                    key={`${appName}_${step.msg}`}
                    className="mb-4 flex flex-row"
                  >
                    <div className="w-1/3">
                      <img
                        src={`https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png`}
                      />
                    </div>
                    <div className="ml-12 flex w-2/3 items-center justify-start">
                      <p>{step.msg}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex w-full justify-around">
              <button
                onClick={onClose}
                className="w-1/2 rounded  bg-slate-600 px-4 py-2 font-bold text-white hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewHistoryModal;
