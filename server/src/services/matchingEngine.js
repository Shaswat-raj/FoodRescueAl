/**
 * FoodRescue AI — NGO Matching Engine
 *
 * ASSUMPTIONS (documented, not scientific):
 * - Travel speed: 20 km/h average (urban, mixed traffic)
 * - Safety buffer: 30 minutes added to estimated pickup time
 * - Capacity: NGOs with pickupCapacity = 0 are treated as unlimited
 * - Distance: Haversine straight-line — actual road distance will be longer
 * - Food safety: time-window eligibility only — human review required before actual pickup
 * - No live traffic, weather, or actual vehicle availability is considered
 */

const ASSUMED_SPEED_KPH = 20
const SAFETY_BUFFER_MINUTES = 30

/**
 * Haversine distance between two lat/lng points (kilometres)
 */
export const haversineKm = (coord1, coord2) => {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLng = toRad(coord2.lng - coord1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Rank NGOs for a given donation.
 *
 * @param {{ lat: number, lng: number }} donorCoords
 * @param {Date}   safeUseBy   - donor's stated safe-use deadline
 * @param {Array}  ngos        - User documents with role === 'NGO'
 * @returns {Array} ranked array of { ngo, distanceKm, estimatedPickupMins, score, eligible, reason }
 */
export const rankNgos = (donorCoords, safeUseBy, ngos) => {
  const now = Date.now()
  const availableMs = new Date(safeUseBy).getTime() - now
  const availableMinutes = availableMs / 60000

  const results = ngos.map((ngo) => {
    const distanceKm = haversineKm(donorCoords, ngo.coordinates)
    const travelMins = (distanceKm / ASSUMED_SPEED_KPH) * 60
    const estimatedPickupMins = Math.ceil(travelMins + SAFETY_BUFFER_MINUTES)

    let eligible = true
    let reason = ''

    if (availableMinutes <= 0) {
      eligible = false
      reason = 'Donation has already passed its safe-use deadline'
    } else if (estimatedPickupMins >= availableMinutes) {
      eligible = false
      reason = `Estimated pickup (${estimatedPickupMins} min) exceeds available window (${Math.floor(availableMinutes)} min)`
    }

    // Capacity score: NGOs with higher capacity ranked slightly higher (0=unlimited → score 1.0)
    const capacityScore = ngo.pickupCapacity === 0 ? 1.0 : Math.min(ngo.pickupCapacity / 50, 1.0)

    // Final score: proximity weighted 60%, capacity 40%
    const proximityScore = eligible ? 1 / (distanceKm + 0.1) : 0
    const score = parseFloat((proximityScore * 0.6 + capacityScore * 0.4).toFixed(4))

    if (eligible && !reason) {
      reason = `${distanceKm.toFixed(1)} km away — est. ${estimatedPickupMins} min (incl. 30 min buffer)`
    }

    return {
      ngo,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      estimatedPickupMins,
      availableMinutes: Math.floor(availableMinutes),
      score,
      eligible,
      reason,
    }
  })

  // Sort: eligible first, then by score descending
  return results.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1
    return b.score - a.score
  })
}
