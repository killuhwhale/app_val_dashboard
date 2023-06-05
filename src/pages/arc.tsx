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
import AppRuns from "~/components/AppRuns";
import DatePicker from "~/components/AppValDatePicker";
import ResultTable from "~/components/ResultTable";
import BarChartPassFailTotals from "~/components/charts/BarChartPassFailTotals";
import LineChartPassFailTotals from "~/components/charts/LineChartPassFailTotals";
import FullColumn from "~/components/columns/FullColumn";
import HalfColumn from "~/components/columns/HalfColumn";
import { getReasonStatObj } from "~/utils/chartUtils";
import {
  formatFirebaseDate,
  formatFromDatepickerToFirebase,
} from "~/utils/dateUtils";
import { frontFirestore, useFirebaseSession } from "~/utils/frontFirestore";

const ARCPage: React.FC = () => {
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
    if (
      startDate.toString() === lastStartDate &&
      endDate.toString() === lastEndDate
    )
      return;

    const q = query(
      collection(frontFirestore, "AppRuns"),
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

      // Set a default doc
      if (init && appRuns[0]) {
        setSelectedDoc(appRuns[0]);
      }
    });
    if (unSubRangeResultsRef.current) unSubRangeResultsRef.current();
    unSubRangeResultsRef.current = unsub;

    setInit(false);
    setLastStartDate(startDate.toString());
    setLastEndDate(endDate.toString());
  }, [init, startDate, endDate]);

  const [appResults, setAppResults] = useState<RawAppResult[]>([]);

  useEffect(() => {
    // const _appResults: RawAppResult[] = [];
    if (!selectedDoc) return;

    // eslint-disable-next-line
    const getSubCollection = async () => {
      // Get Doc on subcollection once, will not update as new apps are added.
      // const results = await getDocs(
      //   collection(frontFirestore, `AppRuns/${selectedDoc.id}/apps`)
      // );
      // results.forEach((appData) => {
      //   console.log("appData: ", appData.data());
      //   _appResults.push(appData.data() as RawAppResult);
      // });
      // processStats(_appResults);

      // Monitor collection as apps are added.
      const unSub = onSnapshot(
        collection(frontFirestore, `AppRuns/${selectedDoc.id}/apps`),
        (colSnap: QuerySnapshot<DocumentData>) => {
          const _appResults: RawAppResult[] = [];

          colSnap.docs.forEach((appData) => {
            _appResults.push(appData.data() as RawAppResult);
          });
          processStats(_appResults);
        }
      );
      if (unSubRef.current) unSubRef.current();
      unSubRef.current = unSub;
    };

    getSubCollection().catch((err) => {
      console.log("Error getting subcolelction.", err);
    });
  }, [selectedDoc]);

  const [totalPassFail, setTotalPassFail] = useState<BarLineChartDataPoint[]>(
    []
  );
  const [appReasonResults, setAppReasonResults] =
    useState<BarLineChartDataPoint[]>();

  const processStats = (appResults: RawAppResult[]) => {
    console.log("Selected doc appResults: ", appResults);

    // Process all stats here
    let totalPass = 0;
    let totalFail = 0;

    const reasons = getReasonStatObj();

    for (let i = 0; i < appResults.length; i++) {
      const {
        status: _status,
        package_name,
        name,
        report_title,
        run_id,
        run_ts,
        build,
        timestamp,
        reason,
        new_name,
        invalid,
        history,
        logs,
      } = appResults[i]!;
      const status = parseInt(_status);

      if (status <= 0) {
        totalPass++;
      } else {
        totalFail++;
      }

      if (status == -3) reasons.LOGGED_IN_FACEBOOK++;
      if (status == -2) reasons.LOGGED_IN_GOOLE++;
      if (status == -1) reasons.LOGGED_IN_EMAIL++;
      if (status == 0) reasons.PASS++;
      if (status == 1) reasons.FAIL++;
      if (status == 2) reasons.CRASH_WIN_DEATH++;
      if (status == 3) reasons.CRASH_FORCE_RM_ACT_RECORD++;
      if (status == 4) reasons.CRASH_ANR++;
      if (status == 5) reasons.CRASH_FDEBUG_CRASH++;
      if (status == 6) reasons.CRASH_FATAL_EXCEPTION++;
      if (status == 7) reasons.NEEDS_PRICE++;
      if (status == 8) reasons.INVALID++;
      if (status == 9) reasons.DID_NOT_OPEN++;
    }

    // Update all stats here with useState()
    setAppResults(appResults);
    setTotalPassFail([
      { name: "Fail", uv: totalFail } as BarLineChartDataPoint,
      { name: "Pass", uv: totalPass } as BarLineChartDataPoint,
    ]);

    console.log("reasons: ", reasons);

    const reasonGraphData = Object.keys(reasons).map((key) => {
      return {
        name: key,
        uv: reasons[key as keyof AppStatus],
      } as BarLineChartDataPoint;
    });

    setAppReasonResults(reasonGraphData);
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
            <AppRuns
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
          <ResultTable
            height={400}
            key={`key__${selectedDoc.id}`}
            parentKey={`key__${selectedDoc.id}`}
            appResults={appResults}
          />
        ) : (
          <div className="flex h-[400px] flex-1 items-center justify-center">
            <p className="text-white">Select an App Run Above</p>
          </div>
        )}
      </FullColumn>

      <HalfColumn height="h-[450px]">
        <div>
          <h2 className="pl-10 text-center">Totals Bar Chart</h2>

          <div className="h-[400px]">
            {appResults.length > 0 ? (
              <BarChartPassFailTotals data={totalPassFail} />
            ) : (
              <div className="flex h-[400px] flex-1 items-center justify-center">
                <p className="text-white">Loading...</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="pl-10 text-center">Totals</h2>

          <div className="h-[400px]">
            {appReasonResults && appReasonResults.length > 0 ? (
              <LineChartPassFailTotals data={appReasonResults} />
            ) : (
              <div className="flex h-[400px] flex-1 items-center justify-center">
                <p className="text-white">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </HalfColumn>
    </>
  );
};

export default ARCPage;
