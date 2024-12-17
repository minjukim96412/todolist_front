import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888/api';

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());
  const [allTodos, setAllTodos] = useState([]);
  const [todos, setTodos] = useState([]); // 오늘의 일정
  const [selectedDateTodos, setSelectedDateTodos] = useState([]); // 선택된 날짜의 일정
  const [upcomingTodos, setUpcomingTodos] = useState([]); // 다가오는 일정
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜
  const [showModal, setShowModal] = useState(false); // 모달 상태
  const [selectedTodo, setSelectedTodo] = useState(null); // 선택된 일정
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  // 로그인 검증
  useEffect(() => {
    if (!user.memId) {
      navigate('/');
    }
  }, [user, navigate]);

  // 전체 일정 가져오기 및 필터링
  const fetchAllTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/todos/mem/${user.memId}`);
      const todosData = response.data;
      setAllTodos(todosData);
      
      // 오늘의 일정, 다가오는 일정, 선택된 날짜 일정 필터링
      const today = new Date().toISOString().split('T')[0];
      const todayTodos = filterTodosByDate(todosData, today);
      setTodos(todayTodos);
      filterUpcomingTodos(todosData);
      
      if (selectedDate) {
        const selectedDateTodos = filterTodosByDate(todosData, selectedDate);
        setSelectedDateTodos(selectedDateTodos);
      } else {
        setSelectedDate(today); // 기본적으로 오늘 날짜로 설정
      }
    } catch (error) {
      alert('일정을 가져오는 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [user.memId, selectedDate]);

  // 일정 필터링 (특정 날짜 기준)
  const filterTodosByDate = (data, date) => {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return data.filter((todo) => {
      const startDate = new Date(todo.startDate);
      const endDate = new Date(todo.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return startDate <= dateObj && endDate >= dateObj;
    });
  };

  // 다가오는 일정 필터링
  const filterUpcomingTodos = (data) => {
    const upcoming = data.filter((todo) => new Date(todo.startDate) > new Date());
    setUpcomingTodos(upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
  };

  // 날짜 선택 핸들러
  const handleDateChange = (date) => {
    const fixedDate = new Date(date);
    fixedDate.setHours(fixedDate.getHours() + 9); // 한국 시간으로 맞춤
    setDate(fixedDate);
    const isoDate = fixedDate.toISOString().split('T')[0]; 
    setSelectedDate(isoDate);
  };

  // 페이지 로드 시 일정 가져오기
  useEffect(() => {
    fetchAllTodos();
  }, [fetchAllTodos]);

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setSelectedTodo(null);
  };

  // 일정 클릭 시 모달 열기
  const openModal = (todo) => {
    setSelectedTodo(todo);
    setShowModal(true);
  };

  // 일정 삭제
  const handleDelete = async () => {
    if (!selectedTodo) return;
    try {
      await axios.delete(`${API_BASE_URL}/todos/${selectedTodo.todoId}`);
      setAllTodos(allTodos.filter(todo => todo.todoId !== selectedTodo.todoId));
      closeModal();
    } catch (error) {
      alert('일정 삭제에 실패했습니다.');
    }
  };

  // 일정 수정
  const handleEdit = () => {
    navigate('/edit-todo', { state: { todo: selectedTodo } });
    closeModal();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0]; // 날짜 형식: YYYY-MM-DD
  
      // 해당 날짜에 일정이 있는지 확인
      const hasTodo = allTodos.some(todo => {
        const startDate = new Date(todo.startDate);
        const endDate = new Date(todo.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
  
        // 날짜 비교: 일정의 시작일이 현재 날짜보다 같거나 이전, 종료일이 현재 날짜보다 이전이면 표시하지 않음
        return (
          (startDate <= date && endDate >= date) ||  // 시작일과 종료일이 해당 날짜에 포함되는 경우
          (startDate.toISOString().split('T')[0] === dateStr) ||  // 시작일이 해당 날짜와 동일한 경우
          (endDate.toISOString().split('T')[0] === dateStr && date < endDate) // 종료일이 해당 날짜와 동일하지만, 종료일 이후는 포함되지 않음
        );
      });
  
      return hasTodo ? <span className="todo-icon">📅</span> : null;
    }
    return null;
  };
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0]; // 날짜 형식: YYYY-MM-DD
  
      // 일정의 시작일과 종료일을 확인하여 선을 연결
      const startDateTodo = allTodos.find(todo => {
        const startDate = new Date(todo.startDate);
        startDate.setHours(0, 0, 0, 0);
        return startDate.toISOString().split('T')[0] === dateStr;
      });
  
      const endDateTodo = allTodos.find(todo => {
        const endDate = new Date(todo.endDate);
        endDate.setHours(23, 59, 59, 999);
        return endDate.toISOString().split('T')[0] === dateStr;
      });
  
      // 시작일과 종료일을 연결하는 선 스타일
      if (startDateTodo && endDateTodo) {
        return 'start-end-todo'; // 클래스 이름을 통해 스타일 적용
      }
    }
    return null;
  };
  
  
  

  return (
    <div className="calendar-container">
      <header>
        <h2>To-Do List</h2>
        <p>{user.nickname}</p>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="calendar-wrapper">
        <div className="calendar-left">
          <Calendar 
            onChange={handleDateChange} 
            value={date} 
            tileContent={tileContent}
            tileClassName={tileClassName}
          />
        </div>

        <div className="calendar-right">
          <div className="today-schedule">
            <h3>오늘의 일정</h3>
            {loading ? (
              <p>로딩 중...</p>
            ) : todos.length === 0 ? (
              <p>오늘의 일정이 없습니다.</p>
            ) : (
              <ul>
                {todos.map((todo) => (
                  <li key={todo.todoId} onClick={() => openModal(todo)}>
                    {todo.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedDateTodos.length > 0 && (
            <div className="selected-date-schedule">
              <h3>{selectedDate}의 일정</h3>
              <ul>
                {selectedDateTodos.map((todo) => (
                  <li key={todo.todoId} onClick={() => openModal(todo)}>
                    {todo.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="upcoming-schedule">
            <h3>다가오는 일정</h3>
            {loading ? (
              <p>로딩 중...</p>
            ) : upcomingTodos.length === 0 ? (
              <p>다가오는 일정이 없습니다.</p>
            ) : (
              <ul>
                {upcomingTodos.slice(0, 3).map((todo) => (
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

      {showModal && selectedTodo && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedTodo.title}</h3>
            <p><strong>시작일:</strong> {new Date(selectedTodo.startDate).toLocaleDateString()}</p>
            <p><strong>종료일:</strong> {new Date(selectedTodo.endDate).toLocaleDateString()}</p>
            <p><strong>내용:</strong> {selectedTodo.description}</p>
            <button onClick={handleEdit}>수정하기</button>
            <button onClick={handleDelete}>삭제하기</button>
            <button onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
