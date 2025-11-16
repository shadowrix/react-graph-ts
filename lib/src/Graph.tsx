import React from 'react'

export function Graph() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  return <canvas ref={canvasRef} />
}
