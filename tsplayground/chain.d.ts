// This type declaration file defines a typed chain() function
// which supports map(), filter() and reduce().
declare module 'chain' {
  interface WrappedValue<T> {
    value(): T
  }
  interface WrappedArray<T> extends WrappedValue<T[]> {
    map<U>(fn: (x: T, i: number) => U): WrappedArray<U>
    filter(fn: (x: T, i: number) => boolean): WrappedArray<T>
    reduce<U>(fn: (acc: U, v: T) => U, base: U): WrappedValue<U>
  }
  function chain<T>(obj: T[]): WrappedArray<T>
  function chain<T>(obj: T): WrappedValue<T>
}
