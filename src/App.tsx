import { useState, useEffect } from 'react'


import ComboBox from './components/ComboBox'
import Map from './components/Map'

import { usePostMessageWithHeight } from './hooks/usePostHeightMessage'


function App({ kraj }: { kraj: string | null }) {
  const [selectedKraj, setSelectedKraj] = useState(kraj || "")
  const [activeTooltip, setActiveTooltip] = useState("")

  const { containerRef, postHeightMessage } = usePostMessageWithHeight(`map-${kraj}`)

  useEffect(() => {
    postHeightMessage()
  }, [kraj, containerRef, postHeightMessage])


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (selectedKraj) {
      searchParams.set('kraj', selectedKraj);
    } else {
      searchParams.delete('kraj');
    }
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [selectedKraj]);



  return (
    <div ref={containerRef} className={"max-w-[620px] mx-auto flex flex-col gap-8"}>
      <div className="text-center">
        <ComboBox kraj={selectedKraj} setKraj={setSelectedKraj} />
      </div>
      <div className={"xs:flex xs:flex-wrap xs:gap-y-8 xs:gap-x-0"}>
        <div className={"xs:w-1/2"}>
          <Map kraj={selectedKraj} property={"ZNEV"} activeTooltip={activeTooltip} setTooltip={setActiveTooltip} boundary={containerRef} />
        </div>
        <div className={"xs:w-1/2"}>
          <Map kraj={selectedKraj} property={"CHUD"} activeTooltip={activeTooltip} setTooltip={setActiveTooltip} boundary={containerRef} />
        </div>
        <div className={"xs:w-1/2"}>
          <Map kraj={selectedKraj} property={"KOALICE"} activeTooltip={activeTooltip} setTooltip={setActiveTooltip} boundary={containerRef} />
        </div>
        <div className={"xs:w-1/2"}>
          <Map kraj={selectedKraj} property={"OPOZICE"} activeTooltip={activeTooltip} setTooltip={setActiveTooltip} boundary={containerRef} />
        </div>
      </div>

    </div>
  )
}

export default App
