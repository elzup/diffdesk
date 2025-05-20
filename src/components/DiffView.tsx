import React, { useState } from 'react'
import { diffLines, diffChars } from 'diff'

interface DiffViewProps {
  text1: string
  text2: string
}

type ViewMode = 'inline' | 'split' | 'split-aligned'

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

  // 行が横並びになる分割表示（同期）
  const renderAlignedSplitView = () => {
    // 行ごとに分割して処理
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')

    // 行ごとの差分を計算
    const lineDiffs = diffLines(text1, text2)

    // 行の対応関係を構築
    const alignedRows: {
      left: string
      right: string
      status: 'added' | 'removed' | 'unchanged'
    }[] = []

    let line1Index = 0
    let line2Index = 0

    lineDiffs.forEach((part) => {
      const partLines = part.value.split('\n')
      // 最後の要素が空文字列の場合は削除（最後の改行による空行）
      if (partLines[partLines.length - 1] === '') {
        partLines.pop()
      }

      if (part.added) {
        // 追加された行
        partLines.forEach((line) => {
          alignedRows.push({ left: '', right: line, status: 'added' })
          line2Index++
        })
      } else if (part.removed) {
        // 削除された行
        partLines.forEach((line) => {
          alignedRows.push({ left: line, right: '', status: 'removed' })
          line1Index++
        })
      } else {
        // 変更のない行
        partLines.forEach((line) => {
          alignedRows.push({ left: line, right: line, status: 'unchanged' })
          line1Index++
          line2Index++
        })
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
          {alignedRows.map((row, index) => (
            <div
              key={`left-${index}`}
              style={{
                color: row.status === 'removed' ? 'red' : 'black',
                backgroundColor:
                  row.status === 'removed' ? '#ffe6e6' : 'transparent',
                whiteSpace: 'pre-wrap',
                minHeight: '1.2em',
                padding: '2px 0',
              }}
            >
              {row.left}
            </div>
          ))}
        </div>
        <div style={{ width: '50%', padding: '8px' }}>
          {alignedRows.map((row, index) => (
            <div
              key={`right-${index}`}
              style={{
                color: row.status === 'added' ? 'green' : 'black',
                backgroundColor:
                  row.status === 'added' ? '#e6ffe6' : 'transparent',
                whiteSpace: 'pre-wrap',
                minHeight: '1.2em',
                padding: '2px 0',
              }}
            >
              {row.right}
            </div>
          ))}
        </div>
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
          onClick={() => {
            // インライン → 分割 → 行揃え分割 → インライン の順に切り替え
            if (viewMode === 'inline') {
              setViewMode('split')
            } else if (viewMode === 'split') {
              setViewMode('split-aligned')
            } else {
              setViewMode('inline')
            }
          }}
        >
          {viewMode === 'inline'
            ? '分割表示'
            : viewMode === 'split'
            ? '行揃え分割表示'
            : 'インライン表示'}
        </button>
      </div>
      {viewMode === 'inline'
        ? renderInlineView()
        : viewMode === 'split'
        ? renderSplitView()
        : renderAlignedSplitView()}
    </div>
  )
}

export default DiffView
