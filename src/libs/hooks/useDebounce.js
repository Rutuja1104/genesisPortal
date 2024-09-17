import { useRef } from "react"

const useDebounce = (timer = 3000) => {
    const timerRef = useRef(null)

    return (callback) => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(callback, timer)
    }
}

export default useDebounce