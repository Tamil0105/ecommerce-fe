import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-ecommerce-xi-tawny.vercel.app/', // Replace with your backend URL
});

export const fetchOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};
export const fetchProducts= async () => {
  const response = await api.get('/product');
  return response.data;
};

export const updateOrder = async (order: { id: number; description: string }) => {
  const response = await api.put(`/orders/${order.id}`, {
    description: order.description,
  });
  return response.data;
};
export const createOrder = async (order: {orderData: {description: string}; productIds: number[] }) => {
  const response = await api.post('/orders', order);
  return response.data;
};

export const deleteOrder = async (id: number) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};
