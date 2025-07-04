import logo from './logo.svg';
import './styles.css';
import AddTodo from "./components/AddTodo"
import TodoList from "./components/TodoList";

function App() {
  return (
    <div className="App">
      {/* <AddTodo>
        
      </AddTodo> */}
      <TodoList></TodoList>
        
    </div>
  );
}

export default App;
