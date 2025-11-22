// const map = new Map()
const map = {}

function testArray(length) {
  const start = performance.now()
  // console.log('start ---->', start)
  for (let i = 0; i < length; i++) {
    // map.set(i, i)
    map[i] = i
    if (i === 100_000) {
      console.log(i)
    }
  }
  console.log('finish ---->', performance.now() - start)
}

testArray(1_000_000)
