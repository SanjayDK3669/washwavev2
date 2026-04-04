import axios from 'axios';

const API = axios.create({
  baseURL: 'https://washwavebackendv2.onrender.com/api',
});

API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('ww_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    const detail = err.response?.data?.detail || '';
    if (detail !== 'Incorrect password' && detail !== 'Phone number not found' && detail !== 'Invalid admin credentials') {
      localStorage.removeItem('ww_token');
      localStorage.removeItem('ww_user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(err);
});

// Auth
export const register  = d => API.post('/auth/register', d);
export const loginApi  = d => API.post('/auth/login', d);
export const getMe     = () => API.get('/auth/me');

// Orders
export const createOrder    = d  => API.post('/orders/', d);
export const razorpayCreate = id => API.post(`/orders/razorpay/create?order_id=${id}`);
export const razorpayVerify = d  => API.post('/orders/razorpay/verify', d);
export const getMyOrders    = () => API.get('/orders/my-orders');
export const trackOrder     = n  => API.get(`/orders/track/${n}`);

// Admin
export const adminAllOrders    = ()  => API.get('/orders/admin/all');
export const adminUpdateStatus = d   => API.put('/orders/admin/status', d);
export const adminStats        = ()  => API.get('/orders/admin/stats');

export default API;