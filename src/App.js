import "./App.css";
import Navbar from "./components/Navbar";
import First from "./components/First";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <First />
      </main>
    </div>
  );
}

export default App;