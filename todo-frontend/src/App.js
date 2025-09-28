import { Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import Dashboard from './components/Dashboard';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/todos" element={
            <ProtectedRoute>
              <TodoList />
              {/* <Dashboard /> */}
            </ProtectedRoute>
          } />
          { <Route path="*" element={<Navigate to="/login" replace/>} /> }
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;