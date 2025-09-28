import React, { useState, useEffect, useContext } from "react";
import AddTodo from "./AddTodo";
import TodoItem from "./TodoItem";
import { fetchTodos, createTodo, deleteTodo as deleteTodoApi, deleteAllTodos } from "../api";
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
  // useEffect(() => {
  //   // Always regenerate mock data to ensure fresh dates
  //   const now = new Date();
  //   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // Set to noon today
  //   const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 30, 0); // Yesterday 2:30 PM
  //   const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 15, 0); // Tomorrow 10:15 AM
  //   const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 16, 45, 0); // Next week 4:45 PM
    
  //   console.log('Force regenerating mock todos with current dates:', {
  //     systemDate: now.toLocaleString(),
  //     today: today.toLocaleString(),
  //     yesterday: yesterday.toLocaleString(),
  //     tomorrow: tomorrow.toLocaleString(),
  //     nextWeek: nextWeek.toLocaleString()
  //   });
    
  //   const mockTodos = [
  //     {
  //       id: `today-${Date.now()}-${Math.random()}`,
  //       title: `Today's Task (${now.getDate()}/${now.getMonth() + 1}) - Review project documentation`,
  //       completed: false,
  //       createdAt: today.toISOString(),
  //       timestamp: today.toISOString()
  //     },
  //     {
  //       id: `yesterday-${Date.now()}-${Math.random()}`, 
  //       title: `Yesterday's Task (${yesterday.getDate()}/${yesterday.getMonth() + 1}) - Completed team meeting`,
  //       completed: true,
  //       createdAt: yesterday.toISOString(),
  //       timestamp: yesterday.toISOString()
  //     },
  //     {
  //       id: `tomorrow-${Date.now()}-${Math.random()}`,
  //       title: `Tomorrow's Task (${tomorrow.getDate()}/${tomorrow.getMonth() + 1}) - Plan quarterly presentation`,
  //       completed: false,
  //       createdAt: tomorrow.toISOString(),
  //       timestamp: tomorrow.toISOString()
  //     },
  //     {
  //       id: `nextweek-${Date.now()}-${Math.random()}`,
  //       title: `Next Week Task (${nextWeek.getDate()}/${nextWeek.getMonth() + 1}) - Team building event planning`,
  //       completed: false,
  //       createdAt: nextWeek.toISOString(),
  //       timestamp: nextWeek.toISOString()
  //     }
  //   ];
    
  //   console.log('Generated mock todos:', mockTodos.map(todo => ({
  //     title: todo.title,
  //     createdAt: todo.createdAt,
  //     localDate: new Date(todo.createdAt).toLocaleString()
  //   })));
    
  //   setTodos(mockTodos);
  // }, []); // Remove dependencies to force regeneration on every mount

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

    // Step 1: Get the title
    const title = typeof dataFromChild === 'string' ? dataFromChild : dataFromChild.title;

    if (!title || !title.trim()) {
        console.error("addTodo was called with an empty title.");
        return;
    }
    
    // Step 2: Create a simple todo object - let backend handle timestamps
    const todoToAdd = {
        title: title.trim(),
        completed: false,
    };

    // Temporary ID for optimistic update
    const newLocalTodo = {
        ...todoToAdd,
        id: `local-${Date.now()}`,
        _id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(), // Only for local display
        timestamp: new Date().toISOString(),
    };

    // Step 3: Optimistic UI update
    setTodos((prev) => [newLocalTodo, ...prev]);

    // Step 4: Backend sync
    try {
        const backendTodo = await createTodo(todoToAdd, token);
        if (backendTodo && (backendTodo.id || backendTodo._id)) {
            // Replace with server version that has proper timestamps
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

  const handleDeleteAll = async () => {
        // Optional: Ask for confirmation
        const isConfirmed = window.confirm("Are you sure you want to delete all of your tasks?");
        
        if (isConfirmed) {
            setError("");
            try {
                await deleteAllTodos();
                setTodos([]); // Immediately clear the todos in the UI
            } catch (err) {
                setError("Failed to delete all tasks.");
            }
        }
    };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
        {/* --- HEADER --- */}
        <header className="mb-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
                {/* Added the current date for a better dashboard feel */}
                <p className="text-lg text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            {/* Display for the active date filter */}
            {selectedDate && (
                <div className="mt-2 text-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-800">
                        Showing tasks for: <strong>{selectedDate.toDateString()}</strong>
                    </span>
                    <button onClick={clearDateFilter} className="ml-4 text-sm font-semibold text-blue-600 hover:text-blue-800">
                        (Clear Filter)
                    </button>
                </div>
            )}
        </header>

        {/* --- MAIN LAYOUT --- */}
        <div className="flex flex-col lg:flex-row gap-8">
            {/* --- SIDEBAR (changed to <aside> for semantics) --- */}
            <aside className="w-full lg:w-[380px] flex-shrink-0 space-y-6">
                <Clock />
                <Calendar 
                    todos={todos}
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate}
                />
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1">
                <section className="bg-white rounded-lg shadow-md p-6">
                    {/* AddTodo component is now inside the main card */}
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <AddTodo onAdd={addTodo} />
                    </div>

                    {/* Dynamic sub-header for the list */}
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        {selectedDate ? `Tasks for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : "All Tasks"}
                    </h2>

                    {error && (
                        <div className="p-3 flex items-center gap-3 bg-red-50 text-red-700 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

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
                                <svg xmlns="http://www.w.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">All Clear!</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedDate 
                                        ? `No tasks found for ${selectedDate.toDateString()}`
                                        : "You have no pending tasks. Add one to get started."
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    </div>
);
};

export default TodoList;
