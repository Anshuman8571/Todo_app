import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or from a token store
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

export const fetchTodos = () =>  API.get('/get-todos');
export const createTodo = (data) => API.post('/add-todo',data);
export const deleteTodo = (id) =>  API.delete(`/delete-todo/${id}`);
export const updateTodo = (id) => API.put(`/update-todo/${id}`)
