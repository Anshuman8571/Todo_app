import React, { useState, useEffect, useContext } from "react";
import AddTodo from "./AddTodo";
import TodoItem from "./TodoItem";
import { fetchTodos, createTodo, deleteTodo as deleteTodoApi } from "../api";
import { AuthContext } from "../context/AuthContext";
import { TodoListSkeleton } from "./TodoListSkeleton";
import Calendar from "./Calendar";
import Clock from "./Clock";
import './TodoList.css'

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const { token } = useContext(AuthContext); // expects token provided by AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredTodos, setFilteredTodos] = useState([]);

  // Normalize many possible response shapes to an array.
  const normalizeTodos = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.todos)) return payload.todos;
    if (Array.isArray(payload?.data)) return payload.data;
    // sometimes axios wraps response as { data: [...] } but fetchTodos() should return axios res
    if (Array.isArray(payload?.data?.todos)) return payload.data.todos;
    return [];
  };

  // Load when token becomes available (protected route usually sets token before redirect)
  useEffect(() => {
    if (!token) return; // don't try to load if we have no token
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Add some mock data for testing when no backend is available
  useEffect(() => {
    // Always regenerate mock data to ensure fresh dates
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // Set to noon today
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 30, 0); // Yesterday 2:30 PM
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 15, 0); // Tomorrow 10:15 AM
    const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 16, 45, 0); // Next week 4:45 PM
    
    console.log('Force regenerating mock todos with current dates:', {
      systemDate: now.toLocaleString(),
      today: today.toLocaleString(),
      yesterday: yesterday.toLocaleString(),
      tomorrow: tomorrow.toLocaleString(),
      nextWeek: nextWeek.toLocaleString()
    });
    
    const mockTodos = [
      {
        id: `today-${Date.now()}-${Math.random()}`,
        title: `Today's Task (${now.getDate()}/${now.getMonth() + 1}) - Review project documentation`,
        completed: false,
        createdAt: today.toISOString(),
        timestamp: today.toISOString()
      },
      {
        id: `yesterday-${Date.now()}-${Math.random()}`, 
        title: `Yesterday's Task (${yesterday.getDate()}/${yesterday.getMonth() + 1}) - Completed team meeting`,
        completed: true,
        createdAt: yesterday.toISOString(),
        timestamp: yesterday.toISOString()
      },
      {
        id: `tomorrow-${Date.now()}-${Math.random()}`,
        title: `Tomorrow's Task (${tomorrow.getDate()}/${tomorrow.getMonth() + 1}) - Plan quarterly presentation`,
        completed: false,
        createdAt: tomorrow.toISOString(),
        timestamp: tomorrow.toISOString()
      },
      {
        id: `nextweek-${Date.now()}-${Math.random()}`,
        title: `Next Week Task (${nextWeek.getDate()}/${nextWeek.getMonth() + 1}) - Team building event planning`,
        completed: false,
        createdAt: nextWeek.toISOString(),
        timestamp: nextWeek.toISOString()
      }
    ];
    
    console.log('Generated mock todos:', mockTodos.map(todo => ({
      title: todo.title,
      createdAt: todo.createdAt,
      localDate: new Date(todo.createdAt).toLocaleString()
    })));
    
    setTodos(mockTodos);
  }, []); // Remove dependencies to force regeneration on every mount

  useEffect(() => {
    // Filter todos based on selected date
    if (selectedDate) {
      // Create a date string for comparison (YYYY-MM-DD format)
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const selectedDay = selectedDate.getDate();
      
      console.log('Filtering todos for date:', {
        selectedDate: selectedDate.toDateString(),
        selectedYear,
        selectedMonth,
        selectedDay
      });
      
      const filtered = todos.filter(todo => {
        if (!todo.createdAt && !todo.timestamp) return false;
        
        const todoDate = new Date(todo.createdAt || todo.timestamp);
        const todoYear = todoDate.getFullYear();
        const todoMonth = todoDate.getMonth();
        const todoDay = todoDate.getDate();
        
        console.log('Comparing todo date:', {
          todoTitle: todo.title,
          todoDate: todoDate.toDateString(),
          todoYear,
          todoMonth,
          todoDay,
          matches: todoYear === selectedYear && todoMonth === selectedMonth && todoDay === selectedDay
        });
        
        // Compare year, month, and day separately to avoid timezone issues
        return todoYear === selectedYear && todoMonth === selectedMonth && todoDay === selectedDay;
      });
      
      console.log('Filtered todos result:', filtered);
      setFilteredTodos(filtered);
    } else {
      setFilteredTodos(todos);
    }
  }, [todos, selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  async function load() {
    setError("");
    setLoading(true);
    try {
      // If your api.fetchTodos expects a token param, pass it; otherwise your api may use an interceptor.
      // We're calling with token — if api uses interceptor it will simply ignore the extra arg.
      const res = await fetchTodos(token);
      // If using axios, real payload is res.data
      const payload = res?.data ?? res;
      const list = normalizeTodos(payload);
      setTodos(list);
      console.log("Loaded todos:", list);
    } catch (err) {
      console.error("fetchTodos failed", err);
      // Try to extract a useful message from axios error shape
      const msg = err?.response?.data?.message || err?.message || "Failed to load todos";
      setError(msg);
      setTodos([]); // keep an array so UI doesn't break
    } finally {
      setLoading(false);
    }
  }

  // In TodoList.js, replace the old addTodo function with this one.
async function addTodo(dataFromChild) {
    setError("");

    // Step 1: Reliably get the title, whether the child sends a string or an object.
    const title = typeof dataFromChild === 'string' ? dataFromChild : dataFromChild.title;

    // Exit if the title is empty.
    if (!title || !title.trim()) {
        console.error("addTodo was called with an empty title.");
        return;
    }
    
    // Step 2: Create a new todo object. ALWAYS generate a fresh timestamp.
    const todoToAdd = {
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
    };

    // This creates a temporary ID for the optimistic update.
    const newLocalTodo = {
        ...todoToAdd,
        id: `local-${Date.now()}`,
        _id: `local-${Date.now()}`
    };

    // Step 3: Optimistically update the UI with the new, correctly-timestamped todo.
    setTodos((prev) => [newLocalTodo, ...prev]);

    // Step 4: The backend sync logic can remain the same.
    try {
        const backendTodo = await createTodo(todoToAdd, token);
        if (backendTodo && (backendTodo.id || backendTodo._id)) {
            // Replace the local version with the final version from the server
            setTodos((prev) => prev.map(todo =>
                todo.id === newLocalTodo.id ? backendTodo : todo
            ));
        }
    } catch (backendError) {
        console.warn("Backend not available, using local state only:", backendError);
    }
}

  async function completeTodo(id) {
    setError("");
    // optimistic UI: toggle completion immediately
    const previous = todos;
    setTodos((prev) => prev.map((t) => 
      (t._id === id || t.id === id) ? { ...t, completed: !t.completed } : t
    ));

    try {
      // You'll need to implement this API call in your api.js
      // await updateTodo(id, { completed: !todo.completed }, token);
      console.log("Todo completion toggled for ID:", id);
      // For now, we'll just keep the optimistic update
    } catch (err) {
      console.error("completeTodo failed", err);
      setError(err?.response?.data?.message || err?.message || "Failed to update todo");
      // rollback UI
      setTodos(previous);
    }
  }

  async function deleteTodo(id) {
    setError("");
    // optimistic UI: remove immediately then call API
    const previous = todos;
    setTodos((prev) => prev.filter((t) => t._id !== id && t.id !== id));

    try {
      await deleteTodoApi(id, token);
      // optionally re-sync: await load();
    } catch (err) {
      console.error("deleteTodo failed", err);
      setError(err?.response?.data?.message || err?.message || "Failed to delete todo");
      // rollback UI
      setTodos(previous);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo List ✅</h1>
        {selectedDate && (
          <div className="date-filter-info">
            <span>Showing todos for {selectedDate.toDateString()}</span>
            <button onClick={clearDateFilter} className="clear-filter-btn ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Show All
            </button>
          </div>
        )}
      </div>

      {/* Main layout with sidebar calendar and main content */}
      <div className="flex gap-6">
        {/* Sidebar with Calendar */}
        <div className="w-[400px] flex-shrink-0">
          <Clock />
          <Calendar 
            todos={todos}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1">
          <section className="bg-white rounded-lg shadow-md p-6">

    {/* Error state with an icon for better visibility */}
    {error && (
        <div className="mt-4 p-3 flex items-center gap-3 bg-red-50 text-red-700 rounded-lg">
            {/* SVG Icon for Warning */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
        </div>
    )}

    {/* The AddTodo component moved to the top */}
    <div className="mb-6">
        <AddTodo onAdd={addTodo} />
    </div>

    {/* Main content area with improved conditional rendering */}
    <div>
        {loading ? (
            <TodoListSkeleton />
        ) : filteredTodos.length > 0 ? (
            <ul className="space-y-3">
                {filteredTodos.map((todo) => (
                    <TodoItem
                        key={todo._id || todo.id}
                        todo={todo}
                        onDelete={() => deleteTodo(todo._id || todo.id)}
                        onComplete={() => completeTodo(todo._id || todo.id)}
                    />
                ))}
            </ul>
        ) : (
            <div className="text-center py-10 px-4">
                {/* SVG Icon for Empty State */}
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
                <p className="mt-1 text-sm text-gray-500">
                    {selectedDate 
                        ? `No todos found for ${selectedDate.toDateString()}`
                        : "You have no pending tasks. Add one above."
                    }
                </p>
            </div>
        )}
    </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
