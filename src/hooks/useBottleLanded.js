import { useEffect, useState } from 'react'

export function useBottleLanded() {
  const [landed, setLanded] = useState(false)
  useEffect(() => {
    const handler = (e) => setLanded(Boolean(e.detail?.landed))
    window.addEventListener('nizaliah:bottle-landed', handler)
    return () => window.removeEventListener('nizaliah:bottle-landed', handler)
  }, [])
  return landed
}
