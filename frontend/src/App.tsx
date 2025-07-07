import { LoginForm } from "@/components/login-form"
import { useState, useEffect } from "react";
import axios from 'axios';

export default function Page() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        axios.get('http://bible-api.com/john 3:16')
           .then(response => {
             console.log(response.data);
             setData(response.data);
             setLoading(false);
           })
           .catch(error => {
             console.error('Error fetching data:', error);
             setError(error);
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
    <>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
    </>
  )
}

