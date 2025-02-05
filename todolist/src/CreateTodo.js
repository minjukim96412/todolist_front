import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';  // 날짜 선택기 CSS
import './createTodo.css';
import { toast } from 'react-toastify';

const CreateTodoPage = () => {
  const navigate = useNavigate();
  const [todoTitle, setTodoTitle] = useState('');
  const [todoContent, setTodoContent] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      await axios.post('http://localhost:8888/api/todos', {
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

      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
      >
        {isSubmitting ? '추가 중...' : '일정 추가'}
      </button>
    </div>
  );
};

export default CreateTodoPage;
