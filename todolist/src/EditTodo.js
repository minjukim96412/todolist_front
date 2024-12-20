import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // 날짜 선택기 CSS
import './createTodo.css';

const EditTodoPage = () => {
  const location = useLocation();
  const { todoId } = location.state || {};
  const navigate = useNavigate();
  const [todoTitle, setTodoTitle] = useState('');
  const [todoContent, setTodoContent] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!todoId) {
      alert('유효하지 않은 접근입니다.');
      navigate(-1); // 이전 페이지로 이동
      return;
    }
  
    const fetchTodo = async () => {
      try {
        const response = await axios.get(`http://localhost:8888/api/todos/${todoId}`);
        const { title, content, startDate, endDate } = response.data;
        setTodoTitle(title);
        setTodoContent(content);
        setStartDate(new Date(startDate));
        setEndDate(new Date(endDate));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching todo:', error);
        setLoading(false);
      }
    };
    fetchTodo();
  }, [todoId, navigate]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8888/api/todos/${todoId}`, {
        title: todoTitle,
        content: todoContent,
        startDate: startDate,
        endDate: endDate,
      });
      console.log('Todo updated successfully');
      navigate('/'); // 수정 후 메인 페이지로 이동
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-todo-container">
      <h2>일정 수정</h2>
      
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
        <p>날짜: </p>
        <p className='dateBlock'>{startDate.toLocaleString()} <br/>
            ~ {endDate.toLocaleString()}</p>
      </div>
      <div className='btnContainer'>
        <button onClick={handleUpdate}>일정 수정</button>
        <button onClick={handleCancel}>취소</button>
      </div>
    </div>
  );
};

export default EditTodoPage;