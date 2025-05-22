import { diffLines, diffChars } from 'diff'
import React from 'react'

/**
 * DiffViewコンポーネントのプロパティ型
 */
export interface DiffViewProps {
  /** 比較元のテキスト */
  text1: string
  /** 比較先のテキスト */
  text2: string
}

/**
 * 表示モードの型
 * - inline: インライン表示
 * - split: 分割表示
 * - split-aligned: 行揃え分割表示
 */
export type ViewMode = 'inline' | 'split' | 'split-aligned'

/**
 * 差分の部分を表す型
 * diffライブラリから返される差分オブジェクトの型
 */
export interface DiffPart {
  /** 差分の内容 */
  value: string
  /** 追加された部分かどうか */
  added?: boolean
  /** 削除された部分かどうか */
  removed?: boolean
}

/**
 * 行の対応関係を表す型
 * 行揃え分割表示で使用
 */
export interface RowType {
  /** 左側（削除側）のテキスト */
  left: string
  /** 右側（追加側）のテキスト */
  right: string
  /** 行の状態 */
  status: 'added' | 'removed' | 'unchanged' | 'modified' | 'spacer'
}

// 将来的に、より複雑な差分ロジックをここに追加できます。
