import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';  // 날짜 선택기 CSS
import './createTodo.css';

const CreateTodoPage = () => {
  const navigate = useNavigate();
  const [todoTitle, setTodoTitle] = useState('');
  const [todoContent, setTodoContent] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8888/api/todos', { 
        memId: user.memId,
        title: todoTitle,
        content: todoContent,
        startDate: startDate,
        endDate: endDate
      });
      console.log('Todo added successfully');
      navigate('/');  // 일정 추가 후 메인 페이지로 이동 (필요에 따라 수정)
    } catch (error) {
      console.error('Error adding todo:', error);
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

      <button onClick={handleSubmit}>일정 추가</button>
    </div>
  );
};

export default CreateTodoPage;
