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
    type RowType = {
      left: string
      right: string
      status: 'added' | 'removed' | 'unchanged' | 'modified' | 'spacer'
    }

    // 削除された行と追加された行をグループ化
    const removedGroups: string[][] = []
    const addedGroups: string[][] = []
    let currentRemoved: string[] = []
    let currentAdded: string[] = []

    // 差分を処理して削除/追加グループを構築
    lineDiffs.forEach((part) => {
      // 行に分割
      let partLines = part.value.split('\n')

      // 最後の要素が空文字列の場合は削除（最後の改行による空行）
      if (partLines[partLines.length - 1] === '') {
        partLines.pop()
      }

      // 空の配列の場合はスキップ
      if (partLines.length === 0) return

      if (part.removed) {
        // 削除された行をグループに追加
        currentRemoved = currentRemoved.concat(partLines)
      } else if (part.added) {
        // 追加された行をグループに追加
        currentAdded = currentAdded.concat(partLines)
      } else {
        // 変更のない行 - 現在のグループを確定して新しいグループを開始
        if (currentRemoved.length > 0 || currentAdded.length > 0) {
          removedGroups.push([...currentRemoved])
          addedGroups.push([...currentAdded])
          currentRemoved = []
          currentAdded = []
        }
      }
    })

    // 最後のグループを追加
    if (currentRemoved.length > 0 || currentAdded.length > 0) {
      removedGroups.push([...currentRemoved])
      addedGroups.push([...currentAdded])
    }

    // 行の対応関係を構築
    const alignedRows: RowType[] = []
    let line1Index = 0
    let line2Index = 0

    // 処理済みのパートを追跡するための配列
    const processedParts = new Set<number>()

    // 差分を処理して行の対応関係を構築
    lineDiffs.forEach((part, partIndex) => {
      // すでに処理済みの場合はスキップ
      if (processedParts.has(partIndex)) return

      // 行に分割
      let partLines = part.value.split('\n')

      // 最後の要素が空文字列の場合は削除（最後の改行による空行）
      if (partLines[partLines.length - 1] === '') {
        partLines.pop()
      }

      // 空の配列の場合はスキップ
      if (partLines.length === 0) return

      if (part.removed) {
        // 削除された行グループを処理
        const removedGroup = partLines
        const nextPartIndex = partIndex + 1
        const nextPart = lineDiffs[nextPartIndex]

        // 次のパートが追加された行かどうかを確認
        if (nextPart && nextPart.added) {
          const addedGroup = nextPart.value.split('\n')
          if (addedGroup[addedGroup.length - 1] === '') {
            addedGroup.pop()
          }

          // 削除と追加の行数を取得
          const removedCount = removedGroup.length
          const addedCount = addedGroup.length
          const maxCount = Math.max(removedCount, addedCount)

          // 行を対応付けて表示
          for (let i = 0; i < maxCount; i++) {
            if (i < removedCount && i < addedCount) {
              // 両方の行が存在する場合
              alignedRows.push({
                left: removedGroup[i],
                right: addedGroup[i],
                status: 'modified',
              })
            } else if (i < removedCount) {
              // 削除された行のみ存在する場合
              alignedRows.push({
                left: removedGroup[i],
                right: '',
                status: 'removed',
              })
            } else if (i < addedCount) {
              // 追加された行のみ存在する場合
              alignedRows.push({
                left: '',
                right: addedGroup[i],
                status: 'added',
              })
            }
          }

          // 次のパートはすでに処理したのでスキップするためにインデックスを更新
          line1Index += removedCount
          line2Index += addedCount

          // 次のパートを処理済みとしてマーク
          processedParts.add(nextPartIndex)
        } else {
          // 対応する追加された行がない場合
          removedGroup.forEach((line) => {
            alignedRows.push({
              left: line,
              right: '',
              status: 'removed',
            })
          })
          line1Index += removedGroup.length
        }
      } else if (part.added) {
        // 追加された行
        const addedGroup = partLines
        addedGroup.forEach((line) => {
          alignedRows.push({
            left: '',
            right: line,
            status: 'added',
          })
        })
        line2Index += addedGroup.length
      } else if (!part.removed && !part.added) {
        // 変更のない行
        partLines.forEach((line) => {
          alignedRows.push({
            left: line,
            right: line,
            status: 'unchanged',
          })
        })
        line1Index += partLines.length
        line2Index += partLines.length
      }
    })

    // 空行の処理を改善
    const finalRows: RowType[] = []
    let i = 0

    while (i < alignedRows.length) {
      const row = alignedRows[i]

      // 空行の場合の特別処理
      if (row.left === '' && row.right === '' && row.status === 'unchanged') {
        // 連続した空行をカウント
        let emptyLineCount = 1
        let j = i + 1

        while (
          j < alignedRows.length &&
          alignedRows[j].left === '' &&
          alignedRows[j].right === '' &&
          alignedRows[j].status === 'unchanged'
        ) {
          emptyLineCount++
          j++
        }

        // 空行を適切に表示
        for (let k = 0; k < emptyLineCount; k++) {
          finalRows.push({
            left: '',
            right: '',
            status: 'unchanged',
          })
        }

        i = j
      } else {
        finalRows.push(row)
        i++
      }
    }

    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <div
          style={{
            width: '50%',
            borderRight: '1px solid #ccc',
            padding: '8px',
          }}
        >
          {finalRows.map((row, index) => (
            <div
              key={`left-${index}`}
              style={{
                color:
                  row.status === 'removed' || row.status === 'modified'
                    ? 'red'
                    : 'black',
                backgroundColor:
                  row.status === 'removed' || row.status === 'modified'
                    ? '#ffe6e6'
                    : 'transparent',
                whiteSpace: 'pre-wrap',
                minHeight: '1.2em',
                padding: '2px 0',
                borderBottom:
                  row.status === 'spacer' ? 'none' : '1px solid #f0f0f0',
              }}
            >
              {row.left}
            </div>
          ))}
        </div>
        <div style={{ width: '50%', padding: '8px' }}>
          {finalRows.map((row, index) => (
            <div
              key={`right-${index}`}
              style={{
                color:
                  row.status === 'added' || row.status === 'modified'
                    ? 'green'
                    : 'black',
                backgroundColor:
                  row.status === 'added' || row.status === 'modified'
                    ? '#e6ffe6'
                    : 'transparent',
                whiteSpace: 'pre-wrap',
                minHeight: '1.2em',
                padding: '2px 0',
                borderBottom:
                  row.status === 'spacer' ? 'none' : '1px solid #f0f0f0',
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
