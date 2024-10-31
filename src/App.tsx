import { useState, useEffect } from "react";

import ComboBox from "./components/ComboBox";
import Map from "./components/Map";

import { usePostMessageWithHeight } from "./hooks/usePostHeightMessage";

function App({ kraj }: { kraj: string | null }) {
  const [selectedKraj, setSelectedKraj] = useState(kraj || "");
  // const selectedKraj = kraj || "";
  //const setIndex = index || "";

  const [activeTooltip, setActiveTooltip] = useState("");
  const { containerRef, postHeightMessage } =
    usePostMessageWithHeight(`map-ucast-rozdil`);

  useEffect(() => {
    postHeightMessage();
  }, [selectedKraj, containerRef, postHeightMessage]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (selectedKraj) {
      searchParams.set("kraj", selectedKraj);
    } else {
      searchParams.delete("kraj");
    }
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [selectedKraj]);

  return (
    <div
      ref={containerRef}
      className={"max-w-[620px] mx-auto flex flex-col gap-6"}
    >
      <div className="flex justify-between items-center">
        <ComboBox kraj={selectedKraj} setKraj={setSelectedKraj} />
        <div className="flex gap-1">
          <div className={"text-xs flex flex-col items-center gap-1"}>
            <div className={"text-zinc-400"}>&#x25BC;</div>
            <div>&#x25BC;</div>
          </div>
          <div className={"text-xs flex flex-col items-start gap-1"}>
            <div>průměr ČR</div>
            <div>průměr kraje</div>
          </div>
        </div>
      </div>
      <div className={"flex flex-col gap-10"}>
        <Map
          kraj={selectedKraj}
          property={"UCAST"}
          activeTooltip={activeTooltip}
          setTooltip={setActiveTooltip}
          boundary={containerRef}
        />
      </div>
    </div>
  );
}

export default App;
