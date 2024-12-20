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

  // 완료 처리
  const handleMarkAsComplete = async () => {
    if (!selectedTodo) return;
    
    try {
      const updatedCompleteYn = selectedTodo.completeYn === true ? false : true;  // 상태를 반전시킴
      
      await axios.patch(`${API_BASE_URL}/todos/${selectedTodo.todoId}`, {
        completeYn: updatedCompleteYn
      });
      
      // 완료 상태 업데이트 후 상태 반영
      setAllTodos(allTodos.map(todo => 
        todo.todoId === selectedTodo.todoId ? { ...todo, completeYn: updatedCompleteYn } : todo
      ));
      fetchAllTodos();
      closeModal();  // 모달 닫기
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
    navigate('/edit-todo', { state: { todoId: selectedTodo.todoId } }); // todoId 전달
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
  
      return hasTodo ? <span className="todo-icon">💕</span> : null;
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
                {upcomingTodos.slice(0, 3).map((todo) => (
                  <li key={todo.todoId} onClick={() => openModal(todo)}>
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

      {/* 삭제 확인 모달 */}
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
