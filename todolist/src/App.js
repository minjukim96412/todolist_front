import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './components/auth/Login';
import CalendarComponent from './components/calendar/Calendar';
import CreateTodoPage from './components/todo/CreateTodo';
import EditTodoPage from './components/todo/EditTodo';
import { configAPI } from './services/api';

function App() {
  const [clientIds, setClientIds] = useState({
    GOOGLE_CLIENT_ID: '',
    KAKAO_KEY: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await configAPI.getConfig();
        const data = response.data;
        
        if (!data.GOOGLE_CLIENT_ID || !data.KAKAO_KEY) {
          throw new Error('Invalid config data');
        }

        setClientIds(data);
      } catch (error) {
        console.error('Error fetching config:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!clientIds.GOOGLE_CLIENT_ID || !clientIds.KAKAO_KEY) {
    return <div>Configuration is missing</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientIds.GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage kakaoKey={clientIds.KAKAO_KEY} />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/create-todo" element={<CreateTodoPage />} />
          <Route path="/edit-todo" element={<EditTodoPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;