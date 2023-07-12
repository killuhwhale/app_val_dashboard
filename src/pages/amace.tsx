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
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import AmaceResultTable from "~/components/AmaceResultTable";
import AmaceRuns from "~/components/AmaceRuns";
import DatePicker from "~/components/AppValDatePicker";
import ResultLink from "~/components/ResultLink";
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

  const router = useRouter();
  const { query: _query } = router;
  // Access individual query parameters
  const qStartDate = _query.s_d as string;
  const qEndDate = _query.e_d as string;
  const qSelectedDocID = _query.id as string;

  const [startDate, setStartDate] = useState(
    qStartDate
      ? new Date(parseInt(qStartDate))
      : new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(
    qEndDate
      ? new Date(parseInt(qEndDate))
      : new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
  );
  const [lastStartDate, setLastStartDate] = useState("");
  const [lastEndDate, setLastEndDate] = useState("");

  const sesh = useFirebaseSession();

  useEffect(() => {
    if (
      startDate.toString() === lastStartDate &&
      endDate.toString() === lastEndDate
    )
      return console.log("Early return due to date", lastStartDate);

    // TODO() probably can remove casting to date?
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
      let selDocIdx = 0;
      let idx = 0;
      querySnapshot.forEach((doc) => {
        // TODO detect doc id and set
        console.log("Doc id", doc.id);
        if (doc.id === qSelectedDocID) {
          selDocIdx = idx;
        }
        appRuns.push(doc);
        idx++;
      });
      setAppRunResults(appRuns);
      console.log("AppRuns: ", appRuns);
      // Set a default doc
      console.log("AppRuns: ", selectedDoc);
      if (!selectedDoc) {
        console.log("Setting Selected Doc: ", appRuns[selDocIdx]);
        setSelectedDoc(appRuns[selDocIdx]);
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
    // console.log("Getting sub collection", selectedDoc);
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
          // console.log("Sub collection SS: ", colSnap);

          colSnap.docs.forEach((appData) => {
            // console.log("Pussing from SS: ", appData.data());
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
    // console.log("Selected doc appResults: ", amaceResults);

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
      if (status == 1) reasons.LaunchFail++;
      if (status == 2) reasons.Crashed++;
      if (status == 10) reasons.Needspurchase++;
      if (status == 20) reasons.Appisold++;
      if (status == 30) reasons.Failedtoinstall++;
      if (status == 40) reasons.Devicenotcompatible++;
      if (status == 50) reasons.CountryNA++;
      if (status == 60) reasons.O4C++;
      if (status == 70) reasons.O4CFSonly++;
      if (status == 80) reasons.FSAmace++;
      if (status == 90) reasons.Phoneonly++;
      if (status == 100) reasons.Tabletonly++;
      if (status == 110) reasons.Amace++;
      if (status == 120) reasons.PWA++;
    }

    // Update all stats here with useState()
    setAppResults(amaceResults);
    setTotalByStatus([
      { name: "Fail", uv: reasons.Fail } as BarLineChartDataPoint,
      { name: "LaunchFail", uv: reasons.LaunchFail } as BarLineChartDataPoint,
      { name: "Crashed", uv: reasons.Crashed } as BarLineChartDataPoint,
      {
        name: "Needspurchase",
        uv: reasons.Needspurchase,
      } as BarLineChartDataPoint,
      { name: "Appisold", uv: reasons.Appisold } as BarLineChartDataPoint,
      {
        name: "Failedtoinstall",
        uv: reasons.Failedtoinstall,
      } as BarLineChartDataPoint,
      {
        name: "Devicenotcompatible",
        uv: reasons.Devicenotcompatible,
      } as BarLineChartDataPoint,
      { name: "CountryNA", uv: reasons.CountryNA } as BarLineChartDataPoint,
      { name: "O4C", uv: reasons.O4C } as BarLineChartDataPoint,
      { name: "O4CFSonly", uv: reasons.O4CFSonly } as BarLineChartDataPoint,
      { name: "FSAmace", uv: reasons.FSAmace } as BarLineChartDataPoint,
      { name: "Phoneonly", uv: reasons.Phoneonly } as BarLineChartDataPoint,
      { name: "Tabletonly", uv: reasons.Tabletonly } as BarLineChartDataPoint,
      { name: "Amace", uv: reasons.Amace } as BarLineChartDataPoint,
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
            startDate={startDate.getTime()}
            endDate={endDate.getTime()}
            selectedDocID={selectedDoc?.id ?? ""}
            page="amace"
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
