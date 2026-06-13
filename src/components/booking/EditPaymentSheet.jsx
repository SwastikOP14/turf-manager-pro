/**
 * EditPaymentSheet
 * ────────────────
 * Bottom-sheet modal for updating a booking's payment details.
 * Opened from the multi-select action bar (1 booking selected → Edit).
 *
 * Props:
 *   booking     – the booking object to edit
 *   players     – full players array (for "Paid By" picker)
 *   onSave      – (updates: object) => void
 *   onClose     – () => void
 */

import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { X, Check, Search } from "lucide-react"
import { useHaptics } from "../../context/HapticsContext"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"
import { formatCurrency } from "../../utils/format"

const STATUS_OPTIONS = ["Pending", "Partial", "Paid"]

export default function EditPaymentSheet({ booking, players, onSave, onClose }) {
  const haptics = useHaptics()
  useModalBackHandler(onClose)

  const miscTotal = (booking.miscCosts || []).reduce((s, c) => s + Number(c.amount), 0)

  // ── State ──────────────────────────────────────────────────────────────
  const [status,      setStatus]      = useState(booking.status || "Pending")
  const [totalAmt,    setTotalAmt]    = useState(String(booking.amount ?? 0))
  const [paidAmt,     setPaidAmt]     = useState(String(booking.paidAmount ?? 0))
  const [misc,        setMisc]        = useState(String(miscTotal))
  const [paidByQuery, setPaidByQuery] = useState("")
  const [paidById,    setPaidById]    = useState(booking.paidByPlayerId || "")
  const [paidByName,  setPaidByName]  = useState(
    players.find(p => p.id === booking.paidByPlayerId)?.name || ""
  )
  const [showPicker, setShowPicker]   = useState(false)

  // ── Derived ────────────────────────────────────────────────────────────
  const total    = (Number(totalAmt) || 0) + (Number(misc) || 0)
  const paid     = status === "Paid" ? total : (Number(paidAmt) || 0)
  const remaining = Math.max(0, total - paid)

  const filteredPlayers = useMemo(() => {
    const q = paidByQuery.trim().toLowerCase()
    if (!q) return players.slice(0, 20)
    return players.filter(p => p.name.toLowerCase().includes(q)).slice(0, 10)
  }, [players, paidByQuery])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSave = () => {
    haptics.trigger([10, 30, 10])
    const paidAmount =
      status === "Paid"    ? total :
      status === "Partial" ? (Number(paidAmt) || 0) :
      0

    onSave({
      status,
      amount:          Number(totalAmt) || 0,
      paidAmount,
      paidByPlayerId:  paidById || undefined,
      miscCosts:       booking.miscCosts || [],   // preserve existing misc items
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 99999, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: "28rem",
          maxHeight: "80vh",
          borderRadius: "24px 24px 0 0",
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ padding: "12px 0 4px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "var(--bg-border)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 16px" }}>
          <div>
            <p style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Update Payment</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>
              {booking.id}
            </p>
          </div>
          <button type="button" onClick={onClose}
            style={{ width: "34px", height: "34px", borderRadius: "10px", border: "none", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable fields */}
        <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* PAID BY */}
          <div>
            <label className="field-label">Paid By</label>
            <div
              onClick={() => setShowPicker(v => !v)}
              style={{
                height: "48px", borderRadius: "12px",
                border: `1.5px solid ${showPicker ? "var(--brand)" : "var(--bg-border)"}`,
                background: "var(--bg-card)", display: "flex", alignItems: "center",
                padding: "0 14px", cursor: "pointer", gap: "8px",
                boxShadow: showPicker ? "var(--shadow-glow)" : "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            >
              <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "14px", color: paidByName ? "var(--text-primary)" : "var(--text-muted)" }}>
                {paidByName || "Select or type player name…"}
              </span>
              {paidByName && (
                <button type="button" onClick={e => { e.stopPropagation(); setPaidById(""); setPaidByName("") }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 1, padding: 0 }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {showPicker && (
              <div style={{
                border: "1.5px solid var(--brand)", borderRadius: "12px", marginTop: "6px",
                background: "var(--bg-card)", overflow: "hidden",
              }}>
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--bg-border)" }}>
                  <input
                    type="text"
                    value={paidByQuery}
                    onChange={e => setPaidByQuery(e.target.value)}
                    placeholder="Search players…"
                    autoFocus
                    style={{
                      width: "100%", border: "none", outline: "none",
                      background: "transparent", fontSize: "13px", color: "var(--text-primary)",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                  {filteredPlayers.map(p => (
                    <button key={p.id} type="button"
                      onClick={() => { setPaidById(p.id); setPaidByName(p.name); setShowPicker(false); setPaidByQuery("") }}
                      style={{
                        width: "100%", padding: "10px 14px", textAlign: "left", border: "none",
                        background: p.id === paidById ? "var(--brand-subtle)" : "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                        fontFamily: "inherit",
                      }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: p.id === paidById ? "var(--brand)" : "var(--text-primary)" }}>{p.name}</span>
                      {p.id === paidById && <Check size={13} style={{ color: "var(--brand)" }} />}
                    </button>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <p style={{ padding: "12px 14px", fontSize: "12px", color: "var(--text-muted)" }}>No players found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PAYMENT STATUS */}
          <div>
            <label className="field-label">Payment Status</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s} type="button"
                  onClick={() => { haptics.trigger(8); setStatus(s) }}
                  style={{
                    flex: 1, height: "40px", borderRadius: "10px",
                    border: status === s ? "none" : "1.5px solid var(--bg-border)",
                    background: status === s
                      ? (s === "Paid" ? "var(--status-paid)" : s === "Partial" ? "var(--status-partial)" : "var(--status-pending)")
                      : "var(--bg-elevated)",
                    color: status === s ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s ease",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* TOTAL AMOUNT */}
          <div>
            <label className="field-label">Total Amount</label>
            <div style={{
              height: "48px", borderRadius: "12px",
              border: "1.5px solid var(--bg-border)", background: "var(--bg-card)",
              display: "flex", alignItems: "center", padding: "0 14px", gap: "8px",
            }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "14px" }}>₹</span>
              <input type="number" inputMode="numeric" value={totalAmt}
                onChange={e => setTotalAmt(e.target.value.replace(/[^0-9]/g, ""))}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* MISCELLANEOUS */}
          <div>
            <label className="field-label">Miscellaneous</label>
            <div style={{
              height: "48px", borderRadius: "12px",
              border: "1.5px solid var(--bg-border)", background: "var(--bg-card)",
              display: "flex", alignItems: "center", padding: "0 14px", gap: "8px",
            }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "14px" }}>₹</span>
              <input type="number" inputMode="numeric" value={misc}
                onChange={e => setMisc(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* CONDITIONAL: Partial — Amount Paid + Remaining */}
          {status === "Partial" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="field-label">Amount Paid</label>
                <div style={{
                  height: "48px", borderRadius: "12px",
                  border: "1.5px solid var(--bg-border)", background: "var(--bg-card)",
                  display: "flex", alignItems: "center", padding: "0 14px", gap: "8px",
                }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "14px" }}>₹</span>
                  <input type="number" inputMode="numeric" value={paidAmt}
                    onChange={e => setPaidAmt(e.target.value.replace(/[^0-9]/g, ""))}
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "inherit" }}
                  />
                </div>
              </div>
              <div style={{
                padding: "12px 14px", borderRadius: "12px",
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>REMAINING BALANCE</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--status-partial)", fontFeatureSettings: '"tnum"' }}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          )}

          {/* CONDITIONAL: Paid — show confirmation */}
          {status === "Paid" && (
            <div style={{
              padding: "12px 14px", borderRadius: "12px",
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>AMOUNT PAID</span>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--status-paid)", fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(total)}
              </span>
            </div>
          )}

          {/* CONDITIONAL: Pending note */}
          {status === "Pending" && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
              Full amount pending
            </p>
          )}

          {/* SAVE */}
          <button type="button" onClick={handleSave} className="btn-primary" style={{ marginTop: "4px" }}>
            Save Payment
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
