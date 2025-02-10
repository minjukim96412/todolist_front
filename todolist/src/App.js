import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './components/auth/Login';
import CalendarComponent from './components/calendar/Calendar';
import CreateTodoPage from './components/todo/CreateTodo';
import EditTodoPage from './components/todo/EditTodo';
import CompletedTodosPage from './components/todo/CompletedTodos';
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
        //console.log("📌 API에서 받은 설정 값:", response.data); // ✅ API 응답 확인
        
        const data = response.data;
        if (!data.GOOGLE_CLIENT_ID || !data.KAKAO_KEY) {
          throw new Error("Invalid config data");
        }
    
        setClientIds(data);
      } catch (error) {
        console.error("Error fetching config:", error);
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
  //console.log("📌 App.js에서 설정된 clientIds:", clientIds);
  
  //console.log("📌 App.js에서 설정된 Kakao Key:", clientIds.KAKAO_KEY); // ✅ 확인용 로그
  
  return (
    <GoogleOAuthProvider clientId={clientIds.GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage kakaoKey={clientIds.KAKAO_KEY} />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/create-todo" element={<CreateTodoPage />} />
          <Route path="/edit-todo" element={<EditTodoPage />} />
          <Route path="/completed-todos" element={<CompletedTodosPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );  
}

export default App;