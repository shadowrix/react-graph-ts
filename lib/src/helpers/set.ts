import { DeepKey, DeepValue } from '../typings/utils'

/**
 * mutable set value by key in object.
 * @param object
 * @param key - is the path separated by `.`
 * @param value
 */
export function set<T extends object, K extends DeepKey<T>>(
  object: T,
  key: K,
  value: DeepValue<T, K>,
) {
  if (typeof object !== 'object' || Array.isArray(object) || !object)
    return object
  const path = key.split('.')

  path.reduce(
    (prev) => {
      if (path.length > 1) {
        if (prev[key]) {
          prev = prev[key]
        } else {
          prev[key] = {}
          prev = prev[key]
        }

        return prev
      }
      prev[path[0]] = value
      return prev
    },
    object as Record<string, any>,
  )
}
