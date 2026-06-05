import type Lenis from "lenis"

let lenisInstance: Lenis | null = null

export const setSmootherInstance = (instance: Lenis | null) => {
  lenisInstance = instance
}

export const getSmoother = (): Lenis | null => lenisInstance
