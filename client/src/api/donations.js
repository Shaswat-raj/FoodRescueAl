import api from './client.js'

export const createDonation  = (data)       => api.post('/donations', data).then(r => r.data)
export const getMyDonations  = ()           => api.get('/donations/my').then(r => r.data)
export const getAvailable    = ()           => api.get('/donations/available').then(r => r.data)
export const getDonation     = (id)         => api.get(`/donations/${id}`).then(r => r.data)
export const acceptDonation  = (id)         => api.patch(`/donations/${id}/accept`).then(r => r.data)
export const rejectDonation  = (id)         => api.patch(`/donations/${id}/reject`).then(r => r.data)
export const cancelDonation  = (id)         => api.patch(`/donations/${id}/cancel`).then(r => r.data)
export const assignVolunteer = (id, data)   => api.post(`/donations/${id}/assign`, data).then(r => r.data)
export const verifyPickup    = (id, otp)    => api.post(`/donations/${id}/verify-pickup`, { otp }).then(r => r.data)
