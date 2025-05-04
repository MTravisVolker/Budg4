import axios from 'axios';

export function addDueBill(data: any, token: string) {
  return axios.post('/api/duebills/', data, { headers: { Authorization: `Bearer ${token}` } });
}

export function editDueBill(id: number, data: any, token: string) {
  return axios.patch(`/api/duebills/${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
}

export function deleteDueBill(id: number, token: string) {
  return axios.delete(`/api/duebills/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
}

export function addBankAccountInstance(data: any, token: string) {
  return axios.post('/api/bankaccountinstances/', data, { headers: { Authorization: `Bearer ${token}` } });
}

export function editBankAccountInstance(id: number, data: any, token: string) {
  return axios.patch(`/api/bankaccountinstances/${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
}

export function deleteBankAccountInstance(id: number, token: string) {
  return axios.delete(`/api/bankaccountinstances/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
} 