"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "motion/react"
import "./motion-color-picker-utils/index.css"

function usePointerPosition() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }
    window.addEventListener("pointerdown", onMove)
    window.addEventListener("pointermove", onMove)
    return () => {
      window.removeEventListener("pointerdown", onMove)
      window.removeEventListener("pointermove", onMove)
    }
  }, [x, y])

  return { x, y }
}

function calculateAngle(index: number, totalInRing: number) {
  return (index / totalInRing) * Math.PI * 2
}

function calculateBasePosition(angle: number, radius: number) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

function calculateHue(angle: number) {
  const hueDegrees = (angle * 180) / Math.PI - 90 - 180
  return ((hueDegrees % 360) + 360) % 360
}

function hslToHex(hsl: string) {
  const match = hsl.match(/hsl\(\s*([\d.-]+),\s*([\d.-]+)%\s*,\s*([\d.-]+)%\s*\)/i)
  if (!match) return "#ffffff"

  const hue = ((Number(match[1]) % 360) + 360) % 360
  const saturation = Number(match[2]) / 100
  const lightness = Number(match[3]) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const section = hue / 60
  const secondary = chroma * (1 - Math.abs((section % 2) - 1))
  const [red, green, blue] = section < 1 ? [chroma, secondary, 0]
    : section < 2 ? [secondary, chroma, 0]
      : section < 3 ? [0, chroma, secondary]
        : section < 4 ? [0, secondary, chroma]
          : section < 5 ? [secondary, 0, chroma]
            : [chroma, 0, secondary]
  const offset = lightness - chroma / 2
  return `#${[red, green, blue].map(value => Math.round((value + offset) * 255).toString(16).padStart(2, "0")).join("")}`
}

function ColorDot({
  ring,
  index,
  totalInRing,
  centerX,
  centerY,
  pointerX,
  pointerY,
  pushMagnitude,
  pushSpring,
  radius,
  selectedColor,
  value,
  setSelectedColor,
  onChange,
}: {
  ring: number
  index: number
  totalInRing: number
  centerX: number
  centerY: number
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  pushMagnitude: number
  pushSpring: SpringOptions
  radius: number
  selectedColor: string | null
  value: string
  setSelectedColor: (color: string | null) => void
  onChange: (color: string) => void
}) {
  const baseRadius = ring * 20
  const angle = calculateAngle(index, totalInRing)
  const { x: baseX, y: baseY } = calculateBasePosition(angle, baseRadius)

  let color = "hsl(0, 0%, 100%)"
  if (ring !== 0) {
    const hue = calculateHue(angle)
    color = ring === 1 ? `hsl(${hue}, 60%, 85%)` : `hsl(${hue}, 90%, 60%)`
  }
  const hexColor = hslToHex(color)

  const pushDistance = useTransform(() => {
    if (centerX === 0 || centerY === 0) return 0

    const px = pointerX.get()
    const py = pointerY.get()
    const fromCenter = Math.hypot(px - centerX, py - centerY)
    if (fromCenter > radius) return 0

    const cursorToDot = Math.hypot(centerX + baseX - px, centerY + baseY - py)
    if (cursorToDot >= 80) return 0
    return (1 - cursorToDot / 80) * pushMagnitude
  })

  const pushAngle = useTransform(() => {
    if (centerX === 0 || centerY === 0) return angle
    return Math.atan2(centerY + baseY - pointerY.get(), centerX + baseX - pointerX.get())
  })

  const pushX = useTransform(() => Math.cos(pushAngle.get()) * pushDistance.get())
  const pushY = useTransform(() => Math.sin(pushAngle.get()) * pushDistance.get())
  const springPushX = useSpring(pushX, pushSpring)
  const springPushY = useSpring(pushY, pushSpring)
  const x = useTransform(() => baseX + springPushX.get())
  const y = useTransform(() => baseY + springPushY.get())
  const isSelected = value.toLowerCase() === hexColor

  return (
    <motion.button
      type="button"
      className="color-dot"
      style={{
        x,
        y,
        backgroundColor: color,
        willChange: "transform, background-color",
      }}
      aria-label={`Choose ${hexColor}`}
      aria-pressed={isSelected}
      title={hexColor}
      variants={{
        default: { scale: 1 },
        hover: { scale: 1.5, transition: { duration: 0.13 } },
      }}
      initial="default"
      whileHover="hover"
      whileTap={{ scale: 1.2 }}
      onClick={() => {
        const nextColor = selectedColor === color ? null : color
        setSelectedColor(nextColor)
        if (nextColor !== null) onChange(hexColor)
      }}
      transition={{ scale: { type: "spring", damping: 30, stiffness: 200 } }}
    >
      <motion.span
        className="color-dot-ring"
        variants={{
          default: { opacity: 0 },
          hover: { opacity: 0.4, transition: { duration: 0.13 } },
        }}
      />
    </motion.button>
  )
}

function GradientCircle({
  index,
  totalInRing,
  centerX,
  centerY,
  pointerX,
  pointerY,
  containerRadius,
}: {
  index: number
  totalInRing: number
  centerX: number
  centerY: number
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  containerRadius: number
}) {
  const angle = calculateAngle(index, totalInRing)
  const { x: baseX, y: baseY } = calculateBasePosition(angle, containerRadius - 40)
  const hue = calculateHue(angle)
  const gradient = `radial-gradient(circle, hsla(${hue}, 90%, 60%, 1) 0%, hsla(${hue}, 90%, 60%, 0) 66%)`

  const proximity = useTransform(() => {
    if (centerX === 0 || centerY === 0) return 0
    const distance = Math.hypot(
      pointerX.get() - (centerX + baseX),
      pointerY.get() - (centerY + baseY),
    )
    return Math.max(0, 1 - distance / 100)
  })

  const opacity = useSpring(useTransform(proximity, [0, 1], [0.15, 0.35]), {
    damping: 30,
    stiffness: 100,
  })
  const scale = useSpring(useTransform(proximity, [0, 1], [1, 1.2]), {
    damping: 30,
    stiffness: 100,
  })

  return (
    <motion.div
      aria-hidden="true"
      className="gradient-circle"
      style={{
        x: baseX,
        y: baseY,
        opacity,
        scale,
        background: gradient,
        willChange: "transform, opacity",
      }}
    />
  )
}

const ORIGINAL_STOPS = [
  "hsl(0, 90%, 60%)",
  "hsl(30, 90%, 60%)",
  "hsl(60, 90%, 60%)",
  "hsl(90, 90%, 60%)",
  "hsl(120, 90%, 60%)",
  "hsl(150, 90%, 60%)",
  "hsl(180, 90%, 60%)",
  "hsl(210, 90%, 60%)",
  "hsl(240, 90%, 60%)",
  "hsl(270, 90%, 60%)",
  "hsl(300, 90%, 60%)",
  "hsl(330, 90%, 60%)",
  "hsl(360, 90%, 60%)",
]

function useConicStops() {
  const stop0 = useMotionValue(ORIGINAL_STOPS[0])
  const stop1 = useMotionValue(ORIGINAL_STOPS[1])
  const stop2 = useMotionValue(ORIGINAL_STOPS[2])
  const stop3 = useMotionValue(ORIGINAL_STOPS[3])
  const stop4 = useMotionValue(ORIGINAL_STOPS[4])
  const stop5 = useMotionValue(ORIGINAL_STOPS[5])
  const stop6 = useMotionValue(ORIGINAL_STOPS[6])
  const stop7 = useMotionValue(ORIGINAL_STOPS[7])
  const stop8 = useMotionValue(ORIGINAL_STOPS[8])
  const stop9 = useMotionValue(ORIGINAL_STOPS[9])
  const stop10 = useMotionValue(ORIGINAL_STOPS[10])
  const stop11 = useMotionValue(ORIGINAL_STOPS[11])
  const stop12 = useMotionValue(ORIGINAL_STOPS[12])
  return useMemo(() => [
    stop0, stop1, stop2, stop3, stop4, stop5, stop6,
    stop7, stop8, stop9, stop10, stop11, stop12,
  ], [stop0, stop1, stop2, stop3, stop4, stop5, stop6, stop7, stop8, stop9, stop10, stop11, stop12])
}

export interface MotionColorPickerProps {
  value: string
  onChange: (color: string) => void
  pushMagnitude?: number
  pushSpring?: SpringOptions
}

export function MotionColorPicker({
  value,
  onChange,
  pushMagnitude = 5,
  pushSpring = { damping: 30, stiffness: 100 },
}: MotionColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [{ centerX, centerY, radius }, setContainerDimensions] = useState({
    centerX: 0,
    centerY: 0,
    radius: 200,
  })
  const pointer = usePointerPosition()
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const stopMotionValues = useConicStops()
  const gradientScale = useMotionValue(1)

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const measure = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setContainerDimensions({
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        radius: rect.width / 2,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(containerRef.current)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [])

  const dots = [
    { ring: 0, index: 0, totalInRing: 1 },
    ...Array.from({ length: 6 }, (_, index) => ({ ring: 1, index, totalInRing: 6 })),
    ...Array.from({ length: 12 }, (_, index) => ({ ring: 2, index, totalInRing: 12 })),
  ]

  useEffect(() => {
    if (selectedColor !== null) {
      for (const stop of stopMotionValues) {
        animate(stop, selectedColor, { duration: 0.2 })
      }
      return
    }
    stopMotionValues.forEach((stop, index) => {
      animate(stop, ORIGINAL_STOPS[index], { duration: 0.2 })
    })
  }, [selectedColor, stopMotionValues])

  useEffect(() => {
    if (selectedColor !== null) {
      animate(gradientScale, 1.1, {
        type: "spring",
        visualDuration: 0.2,
        bounce: 0.8,
        velocity: 2,
      })
      return
    }
    animate(gradientScale, 1, {
      type: "spring",
      visualDuration: 0.2,
      bounce: 0,
    })
  }, [selectedColor, gradientScale])

  const gradientBackground = useTransform(() => {
    return `conic-gradient(from 0deg, ${stopMotionValues.map(stop => stop.get()).join(", ")})`
  })

  return (
    <div className="gradient-wrapper">
      <div className="background">
        <motion.div
          className="gradient-background"
          style={{ background: gradientBackground, scale: gradientScale }}
        />
        <motion.div
          className="solid-background"
          animate={{ scale: selectedColor !== null ? 0.9 : 0.98 }}
          transition={{ type: "spring", visualDuration: 0.2, bounce: 0.2 }}
        />
      </div>
      <div ref={containerRef} className="picker-background">
        {Array.from({ length: 6 }).map((_, index) => (
          <GradientCircle
            key={`gradient-${index}`}
            index={index}
            totalInRing={6}
            centerX={centerX}
            centerY={centerY}
            pointerX={pointer.x}
            pointerY={pointer.y}
            containerRadius={radius}
          />
        ))}
        {dots.slice().reverse().map(dot => (
          <ColorDot
            key={`${dot.ring}-${dot.index}`}
            {...dot}
            centerX={centerX}
            centerY={centerY}
            pointerX={pointer.x}
            pointerY={pointer.y}
            radius={radius}
            pushMagnitude={pushMagnitude}
            pushSpring={pushSpring}
            selectedColor={selectedColor}
            value={value}
            setSelectedColor={setSelectedColor}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}

export default MotionColorPicker
