"use client";

import { Unsubscribe } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import AmaceResultTable from "~/components/AmaceResultTable";
import AmaceRuns from "~/components/AmaceRuns";
import DatePicker from "~/components/AppValDatePicker";
import BarChartPassFailTotals from "~/components/charts/BarChartPassFailTotals";
import FullColumn from "~/components/columns/FullColumn";
import { getAmaceReasonStatObj } from "~/utils/chartUtils";
import {
  formatFirebaseDate,
  formatFromDatepickerToFirebase,
} from "~/utils/dateUtils";
import { frontFirestore, useFirebaseSession } from "~/utils/frontFirestore";

const AMACEPage: React.FC = () => {
  const [init, setInit] = useState(true);
  const unSubRangeResultsRef = useRef<Unsubscribe>();
  const unSubRef = useRef<Unsubscribe>();
  const [appRunResults, setAppRunResults] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [selectedDoc, setSelectedDoc] =
    useState<QueryDocumentSnapshot<DocumentData>>();

  const days = 4;
  const [startDate, setStartDate] = useState(
    new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
  );
  const [lastStartDate, setLastStartDate] = useState("");
  const [lastEndDate, setLastEndDate] = useState("");

  const sesh = useFirebaseSession();

  useEffect(() => {
    console.log("UseEffect first ", lastStartDate);
    if (
      startDate.toString() === lastStartDate &&
      endDate.toString() === lastEndDate
    )
      return console.log("Early return due to date", lastStartDate);

    const q = query(
      collection(frontFirestore, "AmaceRuns"),
      where("date", ">=", formatFirebaseDate(new Date(startDate.getTime()))),
      where(
        "date",
        "<=",
        formatFirebaseDate(
          new Date(endDate.getTime() + 1 * 24 * 60 * 60 * 1000)
        )
      )
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const appRuns: QueryDocumentSnapshot<DocumentData>[] = [];
      querySnapshot.forEach((doc) => {
        appRuns.push(doc);
      });
      setAppRunResults(appRuns);
      console.log("AppRuns: ", appRuns);
      // Set a default doc
      console.log("AppRuns: ", selectedDoc);
      if (!selectedDoc) {
        console.log("Setting Selected Doc: ", appRuns[0]);
        setSelectedDoc(appRuns[0]);
      }
    });
    if (unSubRangeResultsRef.current) unSubRangeResultsRef.current();
    unSubRangeResultsRef.current = unsub;

    setInit(false);
    setLastStartDate(startDate.toString());
    setLastEndDate(endDate.toString());
  }, [init, startDate, endDate]);

  const [appResults, setAppResults] = useState<AmaceDBResult[]>([]);

  useEffect(() => {
    // const _appResults: AmaceDBResult[] = [];
    if (!selectedDoc) return;
    console.log("Getting sub collection", selectedDoc);
    // eslint-disable-next-line
    const getSubCollection = async () => {
      // Get Doc on subcollection once, will not update as new apps are added.
      // const results = await getDocs(
      //   collection(frontFirestore, `AppRuns/${selectedDoc.id}/apps`)
      // );
      // results.forEach((appData) => {
      //   console.log("appData: ", appData.data());
      //   _appResults.push(appData.data() as AmaceDBResult);
      // });
      // processStats(_appResults);

      // Monitor collection as apps are added.
      const unSub = onSnapshot(
        collection(frontFirestore, `AmaceRuns/${selectedDoc.id}/apps`),
        (colSnap: QuerySnapshot<DocumentData>) => {
          const _appResults: AmaceDBResult[] = [];
          console.log("Sub collection SS: ", colSnap);

          colSnap.docs.forEach((appData) => {
            console.log("Pussing from SS: ", appData.data());
            _appResults.push(appData.data() as AmaceDBResult);
          });
          processStats(_appResults);
          //   setAppResults(_appResults);
        }
      );
      if (unSubRef.current) unSubRef.current();
      unSubRef.current = unSub;
    };

    getSubCollection().catch((err) => {
      console.log("Error getting subcolelction.", err);
    });
  }, [selectedDoc]);

  const [totalByStatus, setTotalByStatus] = useState<BarLineChartDataPoint[]>(
    []
  );

  const processStats = (amaceResults: AmaceDBResult[]) => {
    console.log("Selected doc appResults: ", amaceResults);

    const reasons = getAmaceReasonStatObj();

    for (let i = 0; i < amaceResults.length; i++) {
      const {
        appName,
        appTS,
        buildInfo,
        deviceInfo,
        pkgName,
        runID,
        runTS,
        status,
      } = amaceResults[i]!;

      if (status == 0) reasons.Fail++;
      if (status == 1) reasons.PRICE++;
      if (status == 2) reasons.OLDVERSION++;
      if (status == 3) reasons.INSTALLFAIL++;
      if (status == 4) reasons.COUNTRYNA++;
      if (status == 5) reasons.O4C++;
      if (status == 6) reasons.O4CFullScreenOnly++;
      if (status == 7) reasons.IsFSToAmacE++;
      if (status == 8) reasons.IsLockedPAmacE++;
      if (status == 9) reasons.IsLockedTAmacE++;
      if (status == 10) reasons.IsAmacE++;
      if (status == 11) reasons.PWA++;
    }

    // Update all stats here with useState()
    setAppResults(amaceResults);
    setTotalByStatus([
      { name: "Fail", uv: reasons.Fail } as BarLineChartDataPoint,
      { name: "PRICE", uv: reasons.PRICE } as BarLineChartDataPoint,
      { name: "OLDVERSION", uv: reasons.OLDVERSION } as BarLineChartDataPoint,
      { name: "INSTALLFAIL", uv: reasons.INSTALLFAIL } as BarLineChartDataPoint,
      { name: "COUNTRYNA", uv: reasons.COUNTRYNA } as BarLineChartDataPoint,
      { name: "O4C", uv: reasons.O4C } as BarLineChartDataPoint,
      {
        name: "O4CFullScreenOnly",
        uv: reasons.O4CFullScreenOnly,
      } as BarLineChartDataPoint,
      { name: "IsFSToAmacE", uv: reasons.IsFSToAmacE } as BarLineChartDataPoint,
      {
        name: "IsLockedPAmacE",
        uv: reasons.IsLockedPAmacE,
      } as BarLineChartDataPoint,
      {
        name: "IsLockedTAmacE",
        uv: reasons.IsLockedTAmacE,
      } as BarLineChartDataPoint,
      { name: "IsAmacE", uv: reasons.IsAmacE } as BarLineChartDataPoint,
      { name: "PWA", uv: reasons.PWA } as BarLineChartDataPoint,
    ]);
  };

  return (
    <>
      <FullColumn height="h-[60px]">
        <DatePicker
          onStartSelect={(date) =>
            setStartDate(formatFromDatepickerToFirebase(date))
          }
          onEndSelect={(date) =>
            setEndDate(formatFromDatepickerToFirebase(date))
          }
          startDay={startDate}
          endDay={endDate}
        />
      </FullColumn>

      <FullColumn height="h-[120px]">
        <div className="h-full w-full items-center justify-center bg-slate-800">
          {appRunResults.length ? (
            <AmaceRuns
              docs={appRunResults}
              height={0}
              selectedDoc={selectedDoc}
              onSelect={(sDoc) => setSelectedDoc(sDoc)}
            />
          ) : (
            <div className="flex h-[85px] flex-1 items-center justify-center">
              <p className="text-white">No App runs from selected date range</p>
            </div>
          )}
        </div>
      </FullColumn>

      <FullColumn height="h-[545px] mt-6">
        {selectedDoc && appResults.length > 0 ? (
          <AmaceResultTable
            height={400}
            key={`key__${selectedDoc.id}`}
            parentKey={`key__${selectedDoc.id}`}
            amaceResults={appResults}
          />
        ) : (
          <div className="flex h-[400px] flex-1 items-center justify-center">
            <p className="text-white">Select an App Run Above</p>
          </div>
        )}
      </FullColumn>

      <FullColumn height="h-[450px]">
        <div>
          <h2 className="pl-10 text-center">Totals Bar Chart</h2>

          <div className="h-[400px]">
            {appResults.length > 0 ? (
              <BarChartPassFailTotals data={totalByStatus} />
            ) : (
              <div className="flex h-[400px] flex-1 items-center justify-center">
                <p className="text-white">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </FullColumn>
    </>
  );
};

export default AMACEPage;
