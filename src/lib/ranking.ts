// Urutan peringkat tim (/tim + badge Peringkat di detail tim) — aturan bisnis:
// 1. Tim dengan ballot > 0 di atas, diurutkan poin tertinggi (tie-break: nomor kecil dulu).
// 2. Tim nol ballot di bawah.
// 3. Semua nol -> nomor urut ascending (01, 02, ...).
// 4. Ada yang punya ballot -> yang nol diurutkan nomor descending (nomor besar dulu).
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
  const without = teams.filter((t) => val(t) === 0)
  if (withBallots.length === 0) {
    return without.sort((a, b) => num(a) - num(b))
  }
  return [...withBallots, ...without.sort((a, b) => num(b) - num(a))]
}
