import {LoginForm} from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Router>
          <Routes>
            <Route path="/" element={<h1>Hello</h1>} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<RegisterForm />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}
