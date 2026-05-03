import { useEffect, useRef } from 'react'
import './LogSheet.css'

const ROWS = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty (not driving)']
const STATUS_ROW = {
  "off-duty": 0,
  "sleeper": 1,
  "driving": 2,
  "on-duty": 3,
}

const ROW_COLORS = {
  "off-duty": 'rgba(74, 222, 128, 0.55)',
  "sleeper": 'rgba(129, 140, 248, 0.55)',
  "driving": 'rgba(248, 113, 113, 0.55)',
  "on-duty": 'rgba(250, 204, 21, 0.55)',
}

const LINE_COLORS = {
  "off-duty": '#4ade80',
  "sleeper": '#818cf8',
  "driving": '#f87171',
  "on-duty": '#facc15',
}

// Canvas layout constants (pixels)
const MARGIN_LEFT = 128
const MARGIN_TOP = 44
const CELL_WIDTH = 28
const CELL_HEIGHT = 34
const GRID_WIDTH = CELL_WIDTH * 24
const GRID_HEIGHT = CELL_HEIGHT * 4
const BG = '#1e293b'
const GRID_LINE = '#334155'
const TEXT_COLOR = '#e2e8f0'
const TEXT_MUTED = '#94a3b8'


export default function LogSheet({ log }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, 30)

    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.fillStyle = TEXT_COLOR
    ctx.fillText(`Driver's Daily Log — ${log.date}`, 12, 20)

    ctx.font = '12px system-ui, sans-serif'
    ctx.fillStyle = TEXT_MUTED
    ctx.fillText(`Total Miles: ${log.total_miles}`, MARGIN_LEFT + GRID_WIDTH - 80, 20)

    ROWS.forEach((label, rowIndex) => {
      const y = MARGIN_TOP + rowIndex * CELL_HEIGHT + CELL_HEIGHT / 2 + 4
      ctx.fillStyle = TEXT_MUTED
      ctx.font = '11px system-ui, sans-serif'
      ctx.fillText(label, 4, y)
    })

    for (let h = 0; h <= 24; h++) {
      const x = MARGIN_LEFT + h * CELL_WIDTH
      const label = h === 0 ? 'Mid' : h === 12 ? 'Noon' : h === 24 ? 'Mid' : String(h)
      ctx.fillStyle = TEXT_MUTED
      ctx.font = '9px system-ui, sans-serif'
      ctx.fillText(label, x - 6, MARGIN_TOP - 6)
    }

    ctx.strokeStyle = GRID_LINE
    ctx.lineWidth = 0.5

    for (let r = 0; r <= 4; r++) {
      const y = MARGIN_TOP + r * CELL_HEIGHT
      ctx.beginPath()
      ctx.moveTo(MARGIN_LEFT, y)
      ctx.lineTo(MARGIN_LEFT + GRID_WIDTH, y)
      ctx.stroke()
    }

    for (let h = 0; h <= 24; h++) {
      const x = MARGIN_LEFT + h * CELL_WIDTH
      ctx.beginPath()
      ctx.moveTo(x, MARGIN_TOP)
      ctx.lineTo(x, MARGIN_TOP + GRID_HEIGHT)
      ctx.stroke()
    }

    ctx.strokeStyle = '#1e3a5a'
    ctx.lineWidth = 0.5
    for (let h = 0; h < 24; h++) {
      const x = MARGIN_LEFT + h * CELL_WIDTH + CELL_WIDTH / 2
      ctx.beginPath()
      ctx.moveTo(x, MARGIN_TOP)
      ctx.lineTo(x, MARGIN_TOP + GRID_HEIGHT)
      ctx.stroke()
    }

    log.entries.forEach(({ status, start_time, end_time }) => {
      const row = STATUS_ROW[status]
      if (row === undefined) return

      const start = Math.max(0, Math.min(24, start_time))
      const end = Math.max(0, Math.min(24, end_time))
      if (end <= start) return

      const x = MARGIN_LEFT + start * CELL_WIDTH
      const y = MARGIN_TOP + row * CELL_HEIGHT
      const w = (end - start) * CELL_WIDTH
      const h = CELL_HEIGHT

      ctx.fillStyle = ROW_COLORS[status] || 'rgba(148,163,184,0.4)'
      ctx.fillRect(x, y, w, h)

      ctx.strokeStyle = LINE_COLORS[status] || '#94a3b8'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y + h / 2)
      ctx.lineTo(x + w, y + h / 2)
      ctx.stroke()
    })

    if (log.remarks?.length) {
      ctx.font = '11px system-ui, sans-serif'
      ctx.fillStyle = TEXT_MUTED
      log.remarks.forEach((remark, i) => {
        ctx.fillText(remark, MARGIN_LEFT, MARGIN_TOP + GRID_HEIGHT + 18 + i * 14)
      })
    }

    ctx.strokeStyle = GRID_LINE
    ctx.lineWidth = 1
    ctx.strokeRect(MARGIN_LEFT, MARGIN_TOP, GRID_WIDTH, GRID_HEIGHT)
  }, [log])

  const canvasHeight = MARGIN_TOP + GRID_HEIGHT + 40 + (log.remarks?.length || 0) * 14

  return (
    <div className="logsheet-wrapper">
      <canvas
        ref={canvasRef}
        width={MARGIN_LEFT + GRID_WIDTH + 20}
        height={canvasHeight}
      />
    </div>
  )
}
