export function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadFromLocalStorage<T>(key: string): T | null {
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) as T : null
}
