import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const fetchTodos = (token) =>
  API.get('/todos', { headers: { Authorization: `Bearer ${token}` } });
export const createTodo = (data, token) =>
  API.post('/todos', data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteTodo = (id, token) =>
  API.delete(`/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } });