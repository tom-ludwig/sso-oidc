import {LoginForm} from "@/components/login-form";
import {useEffect, useState} from "react";
import axios from "axios";
import { RegisterForm } from "@/components/register-form";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    axios
      .get("https://bible-api.com/john 3:16")
      .then((response) => {
        console.log(response.data);
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    // return <p>Error: {error.message}</p>;
    return <p>Error: {error}</p>;
  }
  if (!data) {
    return <p>No data yet</p>;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Router>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/signup" element={<RegisterForm />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}
