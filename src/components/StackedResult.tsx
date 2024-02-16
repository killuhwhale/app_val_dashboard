"use client";

import { Unsubscribe } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import BarChartPassFailTotals from "~/components/charts/BarChartPassFailTotals";
import FullColumn from "~/components/columns/FullColumn";
import BrokenAppsTable from "~/components/tables/BrokenAppsTable";

import {
  processStats,
  rebuildLatestAmaceResultsFromBrokenResult,
} from "~/utils/chartUtils";
import { bcolors, formatFirebaseDate } from "~/utils/dateUtils";
import { frontFirestore } from "~/utils/frontFirestore";

const MonthlyhRows: React.FC<{
  onSelect(month: QueryDocumentSnapshot<DocumentData>): void;
  selected: QueryDocumentSnapshot<DocumentData> | null;
  monthlyDocs: QueryDocumentSnapshot<DocumentData>[];
}> = ({ onSelect, selected, monthlyDocs }) => {
  const curYear = new Date().getFullYear();

  return (
    <div className="flex flex-col">
      <p> Year: {curYear}</p>
      <div className=" flex w-full flex-row justify-start space-x-2 pl-2">
        {monthlyDocs.map((monthDoc, idx) => {
          return (
            <div
              key={`month_${monthDoc.id}_idc`}
              className={`${
                monthDoc.id === selected?.id ? "bg-slate-700" : "bg-slate-900"
              } ${bcolors[
                idx % bcolors.length
              ]!} max-h-[30px] min-h-[30px] min-w-[140px] cursor-pointer items-center justify-center border p-1 text-white hover:bg-slate-700`}
              onClick={() => onSelect(monthDoc)}
            >
              <p className="text-ellipsis text-center text-xs  md:text-sm">
                {monthDoc.id}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StackedResults: React.FC<{ collectionName: string }> = ({
  collectionName,
}) => {
  const today = new Date();
  const router = useRouter();
  const { query: _query } = router;
  const qSelectedDocID = _query.id as string;
  const unSubRangeResultsRef = useRef<Unsubscribe>();
  const [totalByStatus, setTotalByStatus] = useState<BarLineChartDataPoint[]>(
    []
  );

  const [selectedMonth, setSelectedMonth] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [monthlyDocs, setMonthlyDocs] = useState(
    [] as QueryDocumentSnapshot<DocumentData>[]
  );

  useEffect(() => {
    const q = query(
      collection(frontFirestore, collectionName),
      where(
        "date",
        ">=",
        formatFirebaseDate(new Date(`01-01-${today.getFullYear()}`))
      ),
      where(
        "date",
        "<=",
        formatFirebaseDate(new Date(`12-31-${today.getFullYear()}`))
      )
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      setMonthlyDocs(querySnapshot.docs);
      if (qSelectedDocID) {
        // Find the doc in querySnapshot.docs that matches qSelectedDocID and set it as selected

        for (let i = 0; i < querySnapshot.docs.length; i++) {
          const doc = querySnapshot.docs[i];
          if (doc?.id === qSelectedDocID) {
            setSelectedMonth(doc);
            break;
          }
        }
      } else if (!selectedMonth && querySnapshot.docs[0])
        setSelectedMonth(querySnapshot.docs[0]);
    });

    if (unSubRangeResultsRef.current) unSubRangeResultsRef.current();
    unSubRangeResultsRef.current = unsub;
  }, []);

  const [amaceResults, setAmaceResults] = useState<StackedAppDBResult[]>([]);
  const unSubResultsRef = useRef<Unsubscribe>();

  useEffect(() => {
    if (!selectedMonth) return;
    const col = collection(
      frontFirestore,
      `BrokenApps/${selectedMonth.id}/apps`
    );

    const unSub = onSnapshot(col, (colSnap: QuerySnapshot<DocumentData>) => {
      const _appResults: StackedAppDBResult[] = [];

      colSnap.docs.forEach((appData) => {
        _appResults.push(appData.data() as StackedAppDBResult);
      });

      setTotalByStatus(
        processStats(rebuildLatestAmaceResultsFromBrokenResult(_appResults))
      );
      setAmaceResults(_appResults);
    });
    if (unSubResultsRef.current) unSubResultsRef.current();
    unSubResultsRef.current = unSub;
  }, [selectedMonth]);

  return (
    <>
      <FullColumn height="h-[60px]">
        <MonthlyhRows
          onSelect={setSelectedMonth}
          selected={selectedMonth}
          monthlyDocs={monthlyDocs}
        />
      </FullColumn>

      <FullColumn height="h-[545px] mt-6">
        {selectedMonth ? (
          <BrokenAppsTable
            height={400}
            key={`key__${selectedMonth.id}`}
            parentKey={`key__${selectedMonth.id}`}
            amaceResults={amaceResults}
            selectedDocID={selectedMonth?.id ?? ""}
            page="brokenAppsView"
            path="BrokenApps"
          />
        ) : (
          <></>
        )}
      </FullColumn>

      <FullColumn height="h-[500px]">
        <div>
          <h2 className="pl-10 text-center">Totals Bar Chart</h2>

          <div className="h-[420px]">
            {amaceResults.length > 0 ? (
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

export default StackedResults;
