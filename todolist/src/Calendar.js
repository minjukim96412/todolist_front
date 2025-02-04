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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null); // 선택된 일정
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [calendarData, setCalendarData] = useState({}); // 날짜별 todo 데이터

  // 로그인 검증
  useEffect(() => {
    if (!user.memId) {
      navigate('/');
    }
  }, [user, navigate]);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 전체 일정 가져오기 및 필터링
  const fetchAllTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/todos/mem/${user.memId}/calendar`);
      const data = response.data;
      
      setCalendarData(data);
      
      const uniqueTodos = new Map();
      Object.values(data).flat().forEach(todo => {
        if (!uniqueTodos.has(todo.todoId)) {
          uniqueTodos.set(todo.todoId, todo);
        }
      });
      const allTodosList = Array.from(uniqueTodos.values());
      setAllTodos(allTodosList);
      
      // 현재 시간 가져오기
      const now = new Date();
      const today = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const todayStr = today.toISOString().split('T')[0];
      
      // 오늘의 일정 필터링 (현재 시간 이후에 끝나는 일정만)
      const todayTodos = (data[todayStr] || [])
        .filter(todo => new Date(todo.endDate) > now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
      setTodos(todayTodos);
      
      // 다가오는 일정 필터링 (현재 시간 이후에 시작하는 일정만)
      const upcoming = allTodosList
        .filter(todo => {
          const startTime = new Date(todo.startDate);
          const todoDate = todo.startDate.split(' ')[0];
          return startTime > now && todoDate !== todayStr;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 3);
      
      setUpcomingTodos(upcoming);
      
      if (selectedDate) {
        setSelectedDateTodos(data[selectedDate] || []);
      }
      
    } catch (error) {
      console.error('Error fetching todos:', error);
      alert('일정을 가져오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user.memId, selectedDate]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    // 날짜를 YYYY-MM-DD 형식으로 직접 변환
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    setSelectedDate(formattedDate);
    setSelectedDateTodos(calendarData[formattedDate] || []);
  };

  // 완료 처리
  const handleMarkAsComplete = async () => {
    if (!selectedTodo) return;
    
    try {
      const updatedCompleteYn = selectedTodo.completeYn === true ? false : true;
      
      await axios.patch(`${API_BASE_URL}/todos/${selectedTodo.todoId}`, {
        completeYn: updatedCompleteYn
      });
      
      setAllTodos(allTodos.map(todo => 
        todo.todoId === selectedTodo.todoId ? { ...todo, completeYn: updatedCompleteYn } : todo
      ));
      fetchAllTodos();
      closeModal();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
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

  // 삭제 확인 모달 열기
  const openDeleteConfirm = () => {
    setShowModal(false);
    setShowDeleteConfirm(true);
  };

  // 삭제 확인 모달 닫기
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setShowModal(true);
  };

  // 일정 삭제
  const handleDelete = async () => {
    if (!selectedTodo) return;
    try {
      await axios.delete(`${API_BASE_URL}/todos/${selectedTodo.todoId}`);
      setAllTodos(allTodos.filter(todo => todo.todoId !== selectedTodo.todoId));
      setShowDeleteConfirm(false);
      fetchAllTodos();
    } catch (error) {
      alert('일정 삭제에 실패했습니다.');
    }
  };

  // 일정 수정
  const handleEdit = () => {
    navigate('/edit-todo', { state: { todoId: selectedTodo.todoId } });
    closeModal();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const getRandomColor = (id) => {
    const colors = [
      '#FFB6C1', '#FFD700', '#98FB98', '#87CEEB', 
      '#DDA0DD', '#F0E68C', '#E6E6FA', '#FFA07A'
    ];
    return colors[id % colors.length];
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const koreaDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      const currentDate = koreaDate.toISOString().split('T')[0];
      
      const todosForDate = [];
      if (calendarData[currentDate]) {
        const todoIdsForDate = new Set(calendarData[currentDate].map(todo => todo.todoId));
        allTodos.forEach(todo => {
          if (todoIdsForDate.has(todo.todoId)) {
            todosForDate.push(todo);
          }
        });

        todosForDate.sort((a, b) => {
          const aStart = new Date(a.startDate);
          const bStart = new Date(b.startDate);
          const aEnd = new Date(a.endDate);
          const bEnd = new Date(b.endDate);

          if (aStart.getTime() === bStart.getTime()) {
            return bEnd.getTime() - aEnd.getTime();
          }
          return aStart.getTime() - bStart.getTime();
        });
      }

      return (
        <div className="tile-content">
          {todosForDate.map((todo, index) => (
            <div
              key={`${todo.todoId}-${index}`}
              className="todo-line continue-both"
              style={{
                backgroundColor: getRandomColor(todo.todoId),
                top: `${60 + (index * 15)}%`,
                height: '4px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                openModal(todo);
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <header>
        <h2>TODO LIST</h2>
        <p>
          <span className="nickname">{user.nickname}</span> 님 환영합니다!
        </p>
        <button className='logoutBtn' onClick={handleLogout}>LOGOUT</button>
      </header>

      <div className="calendar-wrapper">
        <div className="calendar-left">
          <Calendar 
            onChange={handleDateChange} 
            value={date} 
            tileContent={tileContent}
            locale="ko-KR"
            calendarType="gregory"
            formatDay={(locale, date) => date.getDate()}
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const today = new Date();
                if (date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()) {
                  return 'highlight-today';
                }
              }
              return null;
            }}
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
                  <li key={todo.todoId} onClick={() => openModal(todo)}>{todo.title}</li>
                ))}
              </ul>
            )}
          </div>

          {selectedDateTodos.length > 0 && (
            <div className="selected-date-schedule">
              <h3>{selectedDate}의 일정</h3>
              <ul>
                {selectedDateTodos.map((todo) => (
                  <li key={todo.todoId} onClick={() => openModal(todo)}>{todo.title}</li>
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
                {upcomingTodos.map((todo) => (
                  <li key={todo.todoId} onClick={() => openModal(todo)}>
                    {todo.title} - {new Date(todo.startDate).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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

      {showDeleteConfirm && (
        <div className="modal">
          <div className="delete-modal-content">
            <h3>정말 삭제하시겠습니까?</h3>
            <button onClick={handleDelete}>확인</button>
            <button onClick={closeDeleteConfirm}>취소</button>
          </div>
        </div>
      )}

      {showModal && selectedTodo && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>×</span>
            <h2>{selectedTodo.title}</h2>
            <h4>{selectedTodo.content}</h4>
            <p>시작일: {formatDate(selectedTodo.startDate)}</p>
            <p>종료일: {formatDate(selectedTodo.endDate)}</p>
            <p>완료 여부: {selectedTodo.completeYn ? '완료' : '진행 중'}</p>
            {selectedTodo.completeYn === false && (
              <button onClick={handleMarkAsComplete}>완료 처리하기</button>
            )}
            {selectedTodo.completeYn === true && (
              <button onClick={handleMarkAsComplete}>미완료</button>
            )}
            <button onClick={handleEdit}>수정</button>
            <button onClick={openDeleteConfirm}>삭제</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;