import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { todoAPI } from '../../services/api';
import 'react-datepicker/dist/react-datepicker.css';  // 날짜 선택기 CSS
import '../../styles/createTodo.css';
import { toast } from 'react-toastify';

const CreateTodoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [todoTitle, setTodoTitle] = useState('');
  const [todoContent, setTodoContent] = useState('');
  const [startDate, setStartDate] = useState(
    location.state?.startDate ? new Date(location.state.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    location.state?.endDate ? new Date(location.state.endDate) : new Date()
  );
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 로그인 검증
  useEffect(() => {
    if (!user.memId) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    // 폼 유효성 검사
    if (!todoTitle.trim() || !todoContent.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 날짜 유효성 검사 추가
    if (endDate < startDate) {
      setError('종료 날짜는 시작 날짜보다 이후여야 합니다.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await todoAPI.createTodo({
        memId: user.memId,
        title: todoTitle.trim(),
        content: todoContent.trim(),
        startDate: startDate,
        endDate: endDate
      });
      
      toast.success('일정이 성공적으로 추가되었습니다!');
      console.log('Todo added successfully');
      navigate('/');
    } catch (error) {
      setError('일정 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error adding todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="create-todo-container">
      <h2>일정 추가</h2>
      
      <div>
        <p>일정 제목:</p>
        <input
          type="text"
          value={todoTitle}
          onChange={(e) => setTodoTitle(e.target.value)}
          placeholder="일정 제목을 입력하세요"
          required
        />
      </div>

      <div>
        <p>일정 내용:</p>
        <textarea
          value={todoContent}
          onChange={(e) => setTodoContent(e.target.value)}
          placeholder="일정 내용을 입력하세요"
          required
        />
      </div>

      <div>
        <p>시작 날짜 및 시간:</p>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd HH:mm"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30} // 30분 단위로 선택
          className="date-picker"
        />
      </div>
      
      <div>
        <p>종료 날짜 및 시간:</p>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd HH:mm"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30} // 30분 단위로 선택
          minDate={startDate}
          className="date-picker"
        />
      </div>

      <div>
        <p>날짜: {startDate.toLocaleString()} <br/>
            ~ {endDate.toLocaleString()}</p>
      </div>

      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <div className='btnContainer'>
      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className='create-todo-btn'
      >
        {isSubmitting ? '추가 중...' : '일정 추가'}
      </button>
      <button onClick={() => navigate(-1)} className='cancel-btn'>취소</button>
      </div>
    </div>
  );
};


export default CreateTodoPage;
