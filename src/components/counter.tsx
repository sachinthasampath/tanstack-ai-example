import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useLocalStorage('counter', 0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key)
    return storedValue ? (JSON.parse(storedValue) as T) : initialValue
  })

  const setLocalStorageValue = (newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setLocalStorageValue] as const
}
