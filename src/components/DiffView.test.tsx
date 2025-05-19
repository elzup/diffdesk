import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import DiffView from './DiffView'

describe('DiffView Component', () => {
  const text1 = 'Hello World'
  const text2 = 'Hello Code'

  it('renders the component', () => {
    render(<DiffView text1={text1} text2={text2} />)
    expect(screen.getByText('Diff View')).toBeInTheDocument()
  })

  it('displays diff', () => {
    render(<DiffView text1={text1} text2={text2} />)
    expect(screen.getByText('World')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
  })

  it('toggles inline diff', () => {
    render(<DiffView text1={text1} text2={text2} />)
    const button = screen.getByRole('button', { name: '文字Diff' })
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: '行Diff' })).toBeInTheDocument()
  })
})
