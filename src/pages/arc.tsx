"use client";
import { useSession } from "next-auth/react";

import { signInWithCustomToken } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import AppRuns from "~/components/AppRuns";
import DatePicker from "~/components/AppValDatePicker";
import AppResults from "~/components/ResultTable";
import FullColumn from "~/components/columns/FullColumn";
import {
  frontEndAuth,
  frontFirestore,
  useFirebaseSession,
} from "~/utils/frontFirestore";
import {
  formatFirebaseDate,
  formatFromDatepickerToFirebase,
} from "~/utils/dateUtils";

const ARCPage: React.FC = () => {
  const [init, setInit] = useState(true);
  const [appRunResults, setAppRunResults] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [selectedDoc, setSelectedDoc] =
    useState<QueryDocumentSnapshot<DocumentData>>();

  const days = 4;
  const [startDate, setStartDate] = useState(
    new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [lastStartDate, setLastStartDate] = useState("");
  const [lastEndDate, setLastEndDate] = useState("");

  const sesh = useFirebaseSession();
  console.log(sesh);

  useEffect(() => {
    if (
      startDate.toString() === lastStartDate &&
      endDate.toString() === lastEndDate
    )
      return;

    const q = query(
      collection(frontFirestore, "AppRuns"),
      where("date", ">=", formatFirebaseDate(startDate)),
      where("date", "<=", formatFirebaseDate(endDate))
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const appRuns: QueryDocumentSnapshot<DocumentData>[] = [];
      querySnapshot.forEach((doc) => {
        console.log("QuerySnapshot doc: ", doc.data());
        appRuns.push(doc);
      });
      setAppRunResults(appRuns);

      // Set a default doc
      if (init && appRuns[0]) {
        setSelectedDoc(appRuns[0]);
      }
    });
    setInit(false);
    setLastStartDate(startDate.toString());
    setLastEndDate(endDate.toString());
  }, [init, startDate, endDate]);

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

      <FullColumn height="h-[85px]">
        <div className="h-full w-full items-center justify-center bg-slate-800">
          {appRunResults.length ? (
            <AppRuns
              docs={appRunResults}
              height={0}
              onSelect={(sDoc) => setSelectedDoc(sDoc)}
            />
          ) : (
            <div className="flex h-[85px] flex-1 items-center justify-center">
              <p className="text-white">No App runs from selected date range</p>
            </div>
          )}
        </div>
      </FullColumn>

      <FullColumn height="h-[530px] mt-6">
        {selectedDoc ? (
          <AppResults
            height={400}
            key={`key__${selectedDoc.id}`}
            doc={selectedDoc}
          />
        ) : (
          <div className="flex h-[400px] flex-1 items-center justify-center">
            <p className="text-white">Select an App Run Above</p>
          </div>
        )}
      </FullColumn>
    </>
  );
};

export default ARCPage;
