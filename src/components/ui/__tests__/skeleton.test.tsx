import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders with default className', () => {
    render(<Skeleton />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-pulse rounded bg-muted')
  })

  it('renders with custom className', () => {
    render(<Skeleton className="w-10 h-10" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('w-10 h-10')
  })
}) 