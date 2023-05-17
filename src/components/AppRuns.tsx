import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { displayDate } from "./ResultTable";

const AppRuns: React.FC<{
  docs: QueryDocumentSnapshot<DocumentData>[];
  height: number;
  onSelect(sDoc: QueryDocumentSnapshot<DocumentData>): void;
}> = ({ docs, height, onSelect }) => {
  return (
    <div className={`pt-2`}>
      <p className="pl-4 text-white">App runs: {docs.length}</p>
      <div className={`flex space-x-4 overflow-auto  p-2`}>
        {docs && docs.length ? (
          docs.map((docu: QueryDocumentSnapshot<DocumentData>) => {
            const data = docu.data() as unknown as AppRun;
            return (
              <div
                key={docu.id}
                className="flex max-h-[30px] min-h-[30px] min-w-[140px] items-center justify-center border border-slate-400 bg-slate-900 p-4 text-white hover:bg-slate-700"
                onClick={() => onSelect(docu)}
              >
                <p className="text-ellipsis text-xs sm:text-sm md:text-base">
                  {displayDate(new Date(data.date?.seconds * 1000))}
                </p>
              </div>
            );
          })
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default AppRuns;
