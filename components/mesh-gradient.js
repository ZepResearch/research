"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect } from "react"

export function MeshGradientComponent({ speed, ...props }) {
  useEffect(() => {
    document.body.classList.add("opacity-100")
  }, [])

  return <MeshGradient {...props} speed={speed ? speed / 10 : 0.25} className="fixed inset-0 -z-10" />
}
