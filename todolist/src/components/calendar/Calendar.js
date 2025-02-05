import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import '../../styles/calendar.css';
import { todoAPI, userAPI, configAPI } from '../../services/api';
import { toast } from 'react-toastify';

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
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kakaoKey, setKakaoKey] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크 모드 상태 추가

  // 로그인 검증
  useEffect(() => {
    if (!user.memId) {
      navigate('/');
    }
  }, [user, navigate]);

  // Kakao SDK 로드 및 초기화
  useEffect(() => {
    const loadKakaoSDK = async () => {
      try {
        // 백엔드에서 카카오 키 가져오기
        const response = await configAPI.getConfig();
        const key = response.data.KAKAO_KEY;  // 백엔드 응답 구조에 맞게 수정
        
        if (!key) {
          console.error('Kakao key not found');
          return;
        }

        setKakaoKey(key);


        // Kakao SDK 스크립트가 이미 있는지 확인
        const existingScript = document.querySelector('script[src="https://developers.kakao.com/sdk/js/kakao.min.js"]');
        
        if (!existingScript) {
          // Kakao SDK 스크립트 로드
          const script = document.createElement('script');
          script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
          script.async = true;
          
          script.onload = () => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
              window.Kakao.init(key);
              console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
            }
          };

          document.head.appendChild(script);
        } else if (window.Kakao && !window.Kakao.isInitialized()) {
          // 스크립트는 있지만 초기화가 안된 경우
          window.Kakao.init(key);
          console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
        }
      } catch (error) {
        console.error('Failed to load Kakao SDK:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response
        });
      }
    };

    loadKakaoSDK();

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      if (window.Kakao?.cleanup) {
        window.Kakao.cleanup();
      }
    };
  }, []);

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
      const response = await todoAPI.getCalendarTodos(user.memId);
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
      if (!user.memId) {
        alert('로그인 정보가 없습니다.');
        navigate('/');
      } else {
        alert('일정을 가져오는 중 문제가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [user.memId, selectedDate, navigate]);

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
      const updatedCompleteYn = !selectedTodo.completeYn;
      await todoAPI.updateTodoStatus(selectedTodo.todoId, updatedCompleteYn);
      
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
      await todoAPI.deleteTodo(selectedTodo.todoId);
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
      '#FF6B6B', // 선명한 빨강
      '#45B7D1', // 밝은 파랑
      '#96CEB4', // 민트
      '#FFB38E', // 주황
      '#CB9DF0', // 보라
      '#BFECFF', // 하늘색
      '#F3D0D7', // 분홍
      '#2ECC71', // 초록
      '#F1C40F'  // 노랑
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
                height: '4px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 2
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal(todo);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  const handleAddTodo = () => {
    // 선택된 날짜가 있으면 해당 날짜의 시작시간을 오전 9시로, 종료시간을 오후 6시로 설정
    const defaultStartTime = selectedDate ? new Date(selectedDate + 'T09:00:00') : new Date();
    const defaultEndTime = selectedDate ? new Date(selectedDate + 'T18:00:00') : new Date();
    
    navigate('/create-todo', { 
      state: { 
        startDate: defaultStartTime,
        endDate: defaultEndTime
      } 
    });
  };

  // 닉네임 수정 모달 열기
  const openNicknameModal = () => {
    setNewNickname(user.nickname);
    setShowNicknameModal(true);
  };

  // 닉네임 수정 모달 닫기
  const closeNicknameModal = () => {
    setShowNicknameModal(false);
    setNewNickname('');
  };

  // 닉네임 수정 처리
  const handleUpdateNickname = async () => {
    if (!newNickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }

    if (newNickname === user.nickname) {
      closeNicknameModal();
      return;
    }

    setIsSubmitting(true);
    try {
      await userAPI.updateNickname(user.memId, newNickname.trim());
      
      // 세션 스토리지 업데이트
      const updatedUser = { ...user, nickname: newNickname.trim() };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('닉네임이 성공적으로 수정되었습니다.');
      closeNicknameModal();
      
      // 현재 페이지 새로고침 없이 닉네임 업데이트
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      toast.error('닉네임 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 카카오톡 공유하기 함수
  const shareToKakao = () => {
    if (!window.Kakao) {
      console.error('Kakao SDK not loaded');
      alert('카카오톡 공유하기를 위한 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!window.Kakao.isInitialized()) {
      try {
        window.Kakao.init(kakaoKey);
      } catch (error) {
        console.error('Failed to initialize Kakao:', error);
        alert('카카오톡 공유하기 초기화에 실패했습니다.');
        return;
      }
    }

    try {
      window.Kakao.Link.sendDefault({
        objectType: 'text',
        text: `[일정 공유]\n제목: ${selectedTodo.title}\n내용: ${selectedTodo.content}\n시작: ${formatDate(selectedTodo.startDate)}\n종료: ${formatDate(selectedTodo.endDate)}`,
        link: {
          mobileWebUrl: 'https://maxi2020.netlify.app/', // 카카오톡에서 클릭 시 이동할 URL
          webUrl: 'https://maxi2020.netlify.app/', // 웹에서도 동일하게 이동
        },
      });
    } catch (error) {
      console.error('Failed to share to Kakao:', error);
      alert('카카오톡 공유하기에 실패했습니다.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    localStorage.setItem('darkMode', !isDarkMode);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
  }, []);

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <header className="calendar-header">
        <h2>TODO LIST</h2>
        <button onClick={toggleDarkMode} className="toggle-button">
          {isDarkMode ? '라이트 모드' : '다크 모드'}
        </button>
        <div className="user-info">
          <span className="nickname">{user.nickname}</span> 님 환영합니다!
          <button className="edit-nickname-btn" onClick={openNicknameModal}>
            닉네임 수정
          </button>
          <button className="logoutBtn" onClick={handleLogout}>LOGOUT</button>
        </div>
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
          <div className={`today-schedule ${loading ? 'loading' : ''}`}>
            <h3>오늘의 일정</h3>
            <ul className={loading ? 'loading' : ''}>
              {loading ? (
                <p>로딩 중...</p>
              ) : todos.length === 0 ? (
                <p>오늘의 일정이 없습니다.</p>
              ) : (
                todos.map((todo) => (
                  <li key={todo.todoId} onClick={() => openModal(todo)}>{todo.title}</li>
                ))
              )}
            </ul>
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

          <button onClick={handleAddTodo}>일정 추가</button>
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
            <p>시작: {formatDate(selectedTodo.startDate)}</p>
            <p>종료: {formatDate(selectedTodo.endDate)}</p>
            <p>
              상태: 
              <span className={`status-badge ${selectedTodo.completeYn ? 'status-complete' : 'status-incomplete'}`}>
                {selectedTodo.completeYn ? '완료' : '진행 중'}
              </span>
            </p>
            <div className="modal-buttons">
              {selectedTodo.completeYn === false && (
                <button onClick={handleMarkAsComplete}>완료 처리</button>
              )}
              {selectedTodo.completeYn === true && (
                <button onClick={handleMarkAsComplete}>미완료로 변경</button>
              )}
              <button onClick={handleEdit}>수정</button>
              <button onClick={openDeleteConfirm}>삭제</button>
              <button onClick={shareToKakao} className="kakao-share-btn">
                <img 
                  src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
                  alt="카카오톡 공유하기"
                  className="kakao-icon"
                />
                공유하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 닉네임 수정 모달 */}
      {showNicknameModal && (
        <div className="modal">
          <div className="modal-content nickname-modal">
            <span className="close-btn" onClick={closeNicknameModal}>×</span>
            <h3>닉네임 수정</h3>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="새로운 닉네임을 입력하세요"
              maxLength={20}
            />
            <div className="modal-buttons">
              <button 
                onClick={handleUpdateNickname}
                disabled={isSubmitting}
              >
                {isSubmitting ? '수정 중...' : '수정'}
              </button>
              <button onClick={closeNicknameModal}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;