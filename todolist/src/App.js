import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // GoogleOAuthProvider 임포트
import LoginPage from './Login'; // 로그인 페이지
import CalendarComponent from './Calendar'; // 캘린더 컴포넌트
import CreateTodoPage from './CreateTodo';
function App() {
  return (
    <GoogleOAuthProvider clientId="351834792305-2adccofjnvfao16qouvvht123u9djg8e.apps.googleusercontent.com"> {/* GoogleOAuthProvider로 감싸기 */}
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} /> {/* 로그인 페이지 경로 설정 */}
          <Route path="/calendar" element={<CalendarComponent />} /> {/* 캘린더 페이지 경로 설정 */}
          <Route path="/create-todo" element={<CreateTodoPage />} /> {/* 캘린더 페이지 경로 설정 */}
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
