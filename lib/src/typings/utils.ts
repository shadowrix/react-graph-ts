type ExcludePrototypeKeys<T> = Exclude<
  keyof T,
  keyof Object | keyof any[] | symbol
>

export type DeepKey<T> = {
  [K in ExcludePrototypeKeys<T> & string]: T[K] extends object
    ? K | `${K}.${DeepKey<T[K]>}`
    : K
}[ExcludePrototypeKeys<T> & string]

export type DeepValue<
  T,
  K extends string,
> = K extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? DeepValue<T[Head], Tail>
    : never
  : K extends keyof T
    ? T[K]
    : never
