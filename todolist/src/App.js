import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // GoogleOAuthProvider 임포트
import LoginPage from './Login'; // 로그인 페이지
import CalendarComponent from './Calendar'; // 캘린더 컴포넌트
import CreateTodoPage from './CreateTodo';
import EditTodoPage from './EditTodo';
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} /> {/* 로그인 페이지 경로 설정 */}
          <Route path="/calendar" element={<CalendarComponent />} /> {/* 캘린더 페이지 경로 설정 */}
          <Route path="/create-todo" element={<CreateTodoPage />} /> {/* 일정 추가 페이지 경로 설정 */}
          <Route path="/edit-todo" element={<EditTodoPage />} /> {/* 일정 수정 페이지 경로 설정 */}
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
