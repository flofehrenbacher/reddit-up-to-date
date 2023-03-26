import { useState, useRef, useEffect } from 'react'

/**
 *
 * @param {String} key The key to set in localStorage for this value
 * @param {Object} defaultValue The value to use if it is not already in localStorage
 */
export function useLocalStorageState<TState>(key: string, defaultValue: TState | (() => TState)) {
  const [state, setState] = useState<TState>(() => {
    if (typeof window === 'undefined')
      return defaultValue instanceof Function ? defaultValue() : defaultValue
    const valueInLocalStorage = window.localStorage.getItem(key)
    if (valueInLocalStorage) {
      // the try/catch is here in case the localStorage value was set before
      // we had the serialization in place (like we do in previous extra credits)
      try {
        return JSON.parse(valueInLocalStorage)
      } catch (error) {
        window.localStorage.removeItem(key)
      }
    }
    // can't do typeof because:
    // https://github.com/microsoft/TypeScript/issues/37663#issuecomment-759728342
    return defaultValue instanceof Function ? defaultValue() : defaultValue
  })

  const prevKeyRef = useRef(key)

  useEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey)
    }
    prevKeyRef.current = key
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState] as const
}
