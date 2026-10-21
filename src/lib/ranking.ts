// Urutan peringkat tim (/tim + badge Peringkat di detail tim) — aturan bisnis:
// 1. Tim dengan ballot > 0 di atas, diurutkan poin tertinggi (tie-break: nomor kecil dulu).
// 2. Tim nol ballot di bawah, diurutkan nomor urut ascending (01, 02, 03... ke bawah).
// Field poin: saat voting ditutup pakai online_ballots, selain itu total_ballots.
export function sortTimRanking<
  T extends { number?: string | number | null; online_ballots?: number | null; total_ballots?: number | null }
>(teams: T[], opts: { closed?: boolean } = {}): T[] {
  const field = opts.closed ? "online_ballots" : "total_ballots"
  const val = (t: T) => Number((t as any)[field] ?? 0)
  const num = (t: T) => parseInt(String(t.number ?? "0").replace(/^0+/, "") || "0", 10)
  const withBallots = teams.filter((t) => val(t) > 0).sort((a, b) => {
    if (val(b) !== val(a)) return val(b) - val(a)
    return num(a) - num(b)
  })
  const without = teams.filter((t) => val(t) === 0).sort((a, b) => num(a) - num(b))
  return [...withBallots, ...without]
}
