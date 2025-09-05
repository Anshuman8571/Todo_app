import React, { useState, useEffect, useContext } from "react";
import AddTodo from "./AddTodo";
import TodoItem from "./TodoItem";
import { fetchTodos, createTodo, deleteTodo as deleteTodoApi } from "../api";
import { AuthContext } from "../context/AuthContext";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const { token } = useContext(AuthContext); // expects token provided by AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function addTodo(title) {
    setError("");
    try {
      // createTodo may expect (data, token) — pass token to be safe
      const res = await createTodo({ title }, token);
      // If backend returns created item in res.data, you can optimistically append:
      const created = res?.data ?? null;
      if (created && (created._id || created.id)) {
        setTodos((prev) => [...prev, created]);
      } else {
        // fallback: re-fetch authoritative list
        await load();
      }
    } catch (err) {
      console.error("createTodo failed", err);
      setError(err?.response?.data?.message || err?.message || "Failed to create todo");
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Todo List</h1>
        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <AddTodo onAdd={addTodo} />

      <ul className="mt-4 space-y-2">
        {Array.isArray(todos) && todos.length > 0 ? (
          todos.map((todo) => (
            <TodoItem
              key={todo._id || todo.id}
              todo={todo}
              onDelete={() => deleteTodo(todo._id || todo.id)}
            />
          ))
        ) : (
          <li className="text-sm text-gray-500">No todos yet.</li>
        )}
      </ul>
    </div>
  );
};

export default TodoList;
