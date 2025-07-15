import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard.tsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
