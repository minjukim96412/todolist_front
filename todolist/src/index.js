import React from 'react';
import ReactDOM from 'react-dom/client'; // 'react-dom/client'로 변경
import App from './App'; // 수정된 App 컴포넌트 가져오기
import './index.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
