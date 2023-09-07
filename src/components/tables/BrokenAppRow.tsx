import React, { ChangeEvent, useLayoutEffect, useState } from "react";

import {
  brokenStatusReasons,
  displayDate,
  displayDateWithTime,
  statusReasons,
} from "../shared";
import {
  EmailIcon,
  FacebookIcon,
  GoogleIcon,
  PlaceholderIcon,
  decodeLoginResults,
} from "./sharedTables";

interface BrokenAppRowProps {
  amaceResult: BrokenAppDBResult;
  decoratedPackageName?: string;
  onClick(item: BrokenAppDBResult): void;
}

const BrokenAppRow: React.FC<BrokenAppRowProps> = ({
  amaceResult,
  decoratedPackageName,
  onClick,
}) => {
  const { pkgName, appName, appType, testedHistory } = amaceResult;

  const _testedHistory = JSON.parse(testedHistory) as TestedHistoryStep[];
  const latestHistory = _testedHistory[_testedHistory.length - 1];

  console.log("latestHistory: ", typeof latestHistory, latestHistory);

  if (!latestHistory) {
    return (
      <tr>
        <td>No data found</td>
      </tr>
    );
  }

  const {
    appTS,
    buildInfo,
    deviceInfo,
    runID,
    runTS,
    status,
    brokenStatus,
    appVersion,
    logs,
    loginResults,
    history,
    testedOndevice,
  } = latestHistory;
  // console.log("decoratedPackageNames", decoratedPackageName);
  const hasLogs = logs?.length > 0 ?? false;
  const loginLabels = [GoogleIcon, FacebookIcon, EmailIcon];

  return (
    <tr
      onClick={() => onClick(amaceResult)}
      className={`${
        status > 59
          ? "border border-slate-600 bg-slate-900 hover:bg-slate-700"
          : "border border-rose-600 bg-rose-900 hover:bg-rose-700"
      }  cursor-pointer  text-white `}
      key={runTS.toString() + pkgName}
    >
      <td
        className={`sticky left-0   ${
          status > 59
            ? "bg-gradient-to-r from-slate-900 via-slate-900 to-slate-700"
            : "bg-gradient-to-r from-rose-900 via-rose-900 to-rose-700"
        }  px-6 py-4 text-xs font-medium`}
        dangerouslySetInnerHTML={{
          __html:
            decoratedPackageName && decoratedPackageName.length > 0
              ? decoratedPackageName
              : pkgName,
        }}
      ></td>

      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {appName}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {statusReasons.get(status.toString())}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {brokenStatusReasons.get(brokenStatus.toString())}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {appType}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {appVersion}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {displayDateWithTime(new Date(appTS))}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {testedOndevice}
      </td>
      <td className="flex flex-row justify-center whitespace-nowrap px-6 py-4 text-xs font-medium">
        {decodeLoginResults(loginResults).map((num, idx) => {
          return loginLabels[idx] && num > 0
            ? loginLabels[idx]!(`llk${idx}_${pkgName}`)
            : PlaceholderIcon(`llk${idx}_${pkgName}`);
        })}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {runID}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {displayDate(new Date(runTS))}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {deviceInfo}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
        {buildInfo}
      </td>
    </tr>
  );
};

export default BrokenAppRow;
