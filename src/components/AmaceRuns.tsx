import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { MouseEvent, MouseEventHandler, PointerEvent, useRef } from "react";
import { displayDate } from "./ResultTable";
import { bcolors, colors } from "~/utils/dateUtils";

const AmaceRuns: React.FC<{
  docs: QueryDocumentSnapshot<DocumentData>[];
  height: number;
  onSelect(sDoc: QueryDocumentSnapshot<DocumentData>): void;
  selectedDoc?: QueryDocumentSnapshot<DocumentData>;
}> = ({ docs, height, onSelect, selectedDoc }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ left: 0, x: 0 });

  const onPointerDown = (ev: PointerEvent) => {
    posRef.current = {
      // The current scroll
      left: containerRef.current?.scrollLeft ?? 0,
      // Get the current mouse position
      x: ev.clientX,
    };
    if (!containerRef.current) return;
    containerRef.current.style.cursor = "grabbing";
    containerRef.current.style.userSelect = "none";

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onPointerUp);
  };

  const onPointerUp = function () {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onPointerUp);
    if (!containerRef.current) return;
    containerRef.current.style.cursor = "grab";
    containerRef.current.style.removeProperty("user-select");
  };

  const onMouseMove = (ev: globalThis.MouseEvent) => {
    if (!containerRef.current) return;
    // How far the mouse has been moved
    const dx = ev.clientX - posRef.current.x;
    // Scroll the element
    containerRef.current.scrollLeft = posRef.current.left - dx;
  };

  return (
    <div className={`pt-1`}>
      <p className="pl-4 text-white">
        App runs:{" "}
        <b>
          <span className={` ${colors[docs.length % colors.length]!}`}>
            {" "}
            {docs.length}
          </span>
        </b>
      </p>
      <div
        ref={containerRef}
        className={`flex h-[75px] items-center space-x-4 overflow-auto p-2`}
      >
        {docs && docs.length ? (
          docs.map((docu: QueryDocumentSnapshot<DocumentData>, idx: number) => {
            const data = docu.data() as unknown as AppRun;
            return (
              <div
                key={docu.id}
                className={`${
                  selectedDoc && selectedDoc.id === docu.id
                    ? "bg-slate-700"
                    : "bg-slate-900"
                } flex max-h-[30px] min-h-[30px] min-w-[140px] items-center justify-center border ${bcolors[
                  idx % bcolors.length
                ]!} p-1 text-white hover:bg-slate-700`}
                onClick={() => onSelect(docu)}
              >
                <p
                  onPointerDown={onPointerDown}
                  className="text-ellipsis text-xs  md:text-sm"
                >
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

export default AmaceRuns;
