import React, { useState } from 'react'
import DiffView from './components/DiffView.tsx'

function App() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')

  return (
    <div>
      <h1>DiffDesk</h1>
      <div style={{ display: 'flex' }}>
        <textarea
          style={{ width: '50%', height: '300px' }}
          value={text1}
          onChange={(e) => setText1(e.target.value)}
        />
        <textarea
          style={{ width: '50%', height: '300px' }}
          value={text2}
          onChange={(e) => setText2(e.target.value)}
        />
      </div>
      <DiffView text1={text1} text2={text2} />
    </div>
  )
}

export default App
