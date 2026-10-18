import api from './client.js'

export const getNearbyNgos = (params) =>
  api.get('/ngos/nearby', { params }).then(r => r.data)
