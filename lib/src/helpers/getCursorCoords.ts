export function getCursorCoords(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  return { x, y }
}
