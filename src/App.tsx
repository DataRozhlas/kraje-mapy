import { useState } from 'react'

import ComboBox from './components/ComboBox'
import Map from './components/Map'

function App({ kraj }: { kraj: string | null }) {
  const [selectedKraj, setSelectedKraj] = useState(kraj || "CZ010")

  return (
    <div className={"max-w-[620px] mx-auto"}>
      <div className="text-center">
        <ComboBox kraj={selectedKraj} setKraj={setSelectedKraj} />
      </div>
      <div>
        <Map kraj={selectedKraj} />
      </div>
    </div>
  )
}

export default App
