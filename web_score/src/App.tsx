import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import Board from "./Board";
function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path=":id" element={<Board />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
