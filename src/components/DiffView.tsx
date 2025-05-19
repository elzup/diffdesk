import React, { useState } from 'react'
import { diffLines, diffChars } from 'diff'

interface DiffViewProps {
  text1: string
  text2: string
}

type ViewMode = 'inline' | 'split'

function DiffView({ text1, text2 }: DiffViewProps) {
  const [inlineDiff, setInlineDiff] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('inline')
  const diff = inlineDiff ? diffChars(text1, text2) : diffLines(text1, text2)

  // 分割表示用に差分を左右に分ける
  const renderSplitView = () => {
    const leftParts: React.ReactNode[] = []
    const rightParts: React.ReactNode[] = []

    diff.forEach((part, index) => {
      const style = {
        color: part.added ? 'green' : part.removed ? 'red' : 'black',
        backgroundColor: part.added
          ? '#e6ffe6'
          : part.removed
          ? '#ffe6e6'
          : 'transparent',
        whiteSpace: 'pre-wrap' as const,
        display: 'block',
      }

      if (part.added) {
        // 追加された部分は右側に表示
        rightParts.push(
          <span key={index} style={style}>
            {part.value}
          </span>
        )
      } else if (part.removed) {
        // 削除された部分は左側に表示
        leftParts.push(
          <span key={index} style={style}>
            {part.value}
          </span>
        )
      } else {
        // 変更のない部分は両方に表示
        leftParts.push(
          <span key={`left-${index}`} style={style}>
            {part.value}
          </span>
        )
        rightParts.push(
          <span key={`right-${index}`} style={style}>
            {part.value}
          </span>
        )
      }
    })

    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <div
          style={{
            width: '50%',
            borderRight: '1px solid #ccc',
            padding: '8px',
          }}
        >
          {leftParts}
        </div>
        <div style={{ width: '50%', padding: '8px' }}>{rightParts}</div>
      </div>
    )
  }

  // インライン表示
  const renderInlineView = () => {
    return diff.map((part, index) => (
      <span
        key={index}
        style={{
          color: part.added ? 'green' : part.removed ? 'red' : 'black',
          backgroundColor: part.added
            ? '#e6ffe6'
            : part.removed
            ? '#ffe6e6'
            : 'transparent',
          whiteSpace: 'pre-wrap',
        }}
      >
        {part.value}
      </span>
    ))
  }

  return (
    <div>
      <h2>Diff View</h2>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setInlineDiff(!inlineDiff)}>
          {inlineDiff ? '行Diff' : '文字Diff'}
        </button>
        <button
          onClick={() =>
            setViewMode(viewMode === 'inline' ? 'split' : 'inline')
          }
        >
          {viewMode === 'inline' ? '分割表示' : 'インライン表示'}
        </button>
      </div>
      {viewMode === 'inline' ? renderInlineView() : renderSplitView()}
    </div>
  )
}

export default DiffView
