let prevReduceController: AbortController | null = null

export function reduceAsync<T, V>(
  array: T[],
  reducer: (acc: V, value: T, index: number, array: T[]) => V,
  initialValue: V,
  chunkSize = 1000,
): Promise<V> {
  if (prevReduceController) prevReduceController.abort()
  prevReduceController = new AbortController()
  const signal = prevReduceController.signal

  return new Promise((resolve, reject) => {
    let index = 0
    let acc = initialValue

    function processChunk() {
      if (signal.aborted) return reject('aborted')

      const end = Math.min(index + chunkSize, array.length)

      for (let i = index; i < end; i++) {
        if (signal.aborted) return reject('aborted')

        acc = reducer(acc, array[i], i, array)
      }

      index = end

      if (index >= array.length) {
        return resolve(acc)
      }

      requestAnimationFrame(processChunk)
    }

    requestAnimationFrame(processChunk)
  })
}
