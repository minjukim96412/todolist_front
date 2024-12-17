import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './calendar.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888/api';

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [upcomingTodos, setUpcomingTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.memId) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  // 일정 가져오기 (날짜에 맞춰)
  const fetchTodos = async (selectedDate) => {
    setLoading(true);
    try {
      // 전체 일정 가져오기
      const response = await axios.get(`${API_BASE_URL}/todos/mem/${user.memId}`);
      const allTodos = response.data;
  
      // 선택한 날짜의 일정만 필터링
      const filteredTodos = allTodos.filter((todo) => {
        const todoDate = new Date(todo.startDate).toISOString().split('T')[0];
        return todoDate === selectedDate;  // 선택한 날짜와 일정 날짜 비교
      });
      setTodos(filteredTodos);
  
      // 다가오는 일정 필터링
      const upcoming = allTodos.filter((todo) => new Date(todo.startDate) > new Date());
      setUpcomingTodos(upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
    } catch (error) {
      alert('일정을 가져오는 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setDate(date);
    const isoDate = date.toISOString().split('T')[0];  // ISO 형식으로 변환
    setSelectedDate(isoDate);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchTodos(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div className="calendar-container">
      <header>
        <h2>To-Do List</h2>
        <p>{user.nickname}</p>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="calendar-wrapper">
        <div className="calendar-left">
          <Calendar onChange={handleDateChange} value={date} />
        </div>

        <div className="calendar-right">
          <div className="today-schedule">
            <h3>오늘의 일정</h3>
            {loading ? (
              <p>로딩 중...</p>
            ) : (
              <>
                {todos.length === 0 ? (
                  <p>오늘의 일정이 없습니다.</p>
                ) : (
                  <ul>
                    {todos.map((todo) => (
                      <li key={todo.todoId}>{todo.title}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="upcoming-schedule">
            <h3>다가오는 일정</h3>
            {upcomingTodos.length === 0 ? (
              <p>다가오는 일정이 없습니다.</p>
            ) : (
              <ul>
                {upcomingTodos.slice(0, 3).map((todo) => ( // 가장 가까운 3개 일정만 표시
                  <li key={todo.todoId}>
                    {todo.title} - {new Date(todo.startDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={() => navigate('/create-todo', { state: { date: selectedDate } })}>
            일정 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
