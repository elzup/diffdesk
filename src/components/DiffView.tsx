import React from 'react'
import { diffLines } from 'diff'

interface DiffViewProps {
  text1: string
  text2: string
}

function DiffView({ text1, text2 }: DiffViewProps) {
  const diff = diffLines(text1, text2)

  return (
    <div>
      <h2>Diff View</h2>
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
