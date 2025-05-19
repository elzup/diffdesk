import React, { useState } from 'react'
import { diffLines, diffChars } from 'diff'

interface DiffViewProps {
  text1: string
  text2: string
}

function DiffView({ text1, text2 }: DiffViewProps) {
  const [inlineDiff, setInlineDiff] = useState(true)
  const diff = inlineDiff ? diffChars(text1, text2) : diffLines(text1, text2)

  return (
    <div>
      <h2>Diff View</h2>
      <button onClick={() => setInlineDiff(!inlineDiff)}>
        {inlineDiff ? '行Diff' : '文字Diff'}
      </button>
      {diff.map((part, index) => (
        <span
          key={index}
          style={{
            color: part.added ? 'green' : part.removed ? 'red' : 'black',
            backgroundColor: part.added
              ? '#e6ffe6'
              : part.removed
              ? '#ffe6e6'
              : 'transparent',
          }}
        >
          {part.value}
        </span>
      ))}
    </div>
  )
}

export default DiffView
