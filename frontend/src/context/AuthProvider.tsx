import React, { useEffect, useState, createContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:8080/') return;

      const { type, token, user } = event.data;
      if (type === 'SSO_AUTH_SUCCESS') {
        setUser(user);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Trigger the iframe check once on load
  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'http://localhost:8080/authorize?origin=http://localhost:5173/';
    document.body.appendChild(iframe);
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
