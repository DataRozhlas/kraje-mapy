import { useState, useEffect } from 'react'


import ComboBox from './components/ComboBox'
import Map from './components/Map'

function App({ kraj }: { kraj: string | null }) {
  const [selectedKraj, setSelectedKraj] = useState(kraj || "")

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
    <div className={"max-w-[620px] mx-auto flex flex-col gap-8"}>
      <div className="text-center">
        <ComboBox kraj={selectedKraj} setKraj={setSelectedKraj} />
      </div>
      <div className={"sm:flex sm:flex-wrap sm:gap-y-8 sm:gap-x-0"}>
        <div className={"sm:w-1/2"}>
          <Map kraj={selectedKraj} property={"ZNEV"} />
        </div>
        <div className={"sm:w-1/2"}>
          <Map kraj={selectedKraj} property={"CHUD"} />
        </div>
        <div className={"sm:w-1/2"}>
          <Map kraj={selectedKraj} property={"KOALICE"} />
        </div>
        <div className={"sm:w-1/2"}>
          <Map kraj={selectedKraj} property={"OPOZICE"} />
        </div>
      </div>

    </div>
  )
}

export default App
