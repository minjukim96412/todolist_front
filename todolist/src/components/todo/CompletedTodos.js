import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { todoAPI } from "../../services/api"; // API 호출을 위한 todoAPI import
import '../../styles/completeTodo.css'; // 스타일 파일 추가

const CompletedTodosPage = () => {
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const todosPerPage = 5; // 한 페이지에 표시할 일정 수
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const navigate = useNavigate(); // useNavigate 훅 추가

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await todoAPI.getCompletedTodos(user.memId);
        console.log("📌 API 응답 데이터:", response.data); // 🔹 API 응답 확인

        let allTodos = [];

        // ✅ API 응답이 배열인지 확인 후 변환
        if (Array.isArray(response.data)) {
          allTodos = response.data; // 응답이 배열이라면 그대로 사용
        } else if (typeof response.data === "object") {
          // ✅ 객체인 경우, 값들을 모아 배열로 변환
          allTodos = Object.values(response.data).flat();
        }

        // ✅ completeYn이 true인 일정만 필터링 및 최신 순으로 정렬
        const completed = allTodos.filter(todo => todo.completeYn).sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        setCompletedTodos(completed);
      } catch (error) {
        console.error("❌ 일정을 가져오는 데 실패했습니다:", error);
      }
    };

    fetchTodos();
  }, [user.memId]);

  const handleDelete = async (todoId) => {
    try {
      await todoAPI.deleteTodo(todoId); // API를 통해 삭제
      setCompletedTodos(completedTodos.filter(todo => todo.todoId !== todoId)); // 상태 업데이트
    } catch (error) {
      alert("일정 삭제에 실패했습니다.");
    }
  };

  const handleMarkAsInProgress = async (todoId) => {
    try {
      await todoAPI.updateTodoStatus(todoId, false); // API를 통해 상태 변경
      setCompletedTodos(completedTodos.filter(todo => todo.todoId !== todoId)); // 상태 업데이트
    } catch (error) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  // 현재 페이지에 표시할 일정 가져오기
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = completedTodos.slice(indexOfFirstTodo, indexOfLastTodo);

  // 페이지 변경 핸들러
  const handlePageChange = (direction) => {
    if (direction === 'next' && indexOfLastTodo < completedTodos.length) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="completed-todos-container">
      <h2>완료된 일정</h2>
      {completedTodos.length > 0 ? (
        <ul>
          {currentTodos.map(todo => (
            <li key={todo.todoId} className="completed-todo-item">
              <h3 className="todo-title">{todo.title}</h3>
              <p className="todo-dates">
                시작: {new Date(todo.startDate).toLocaleString("ko-KR")} <br />
                종료: {new Date(todo.endDate).toLocaleString("ko-KR")}
              </p>
              <div>
                <button onClick={() => handleDelete(todo.todoId)}>삭제</button>
                <button onClick={() => handleMarkAsInProgress(todo.todoId)}>진행 중으로 변경하기</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>완료된 일정이 없습니다.</p>
      )}
      <div className="pagination">
        <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>이전</button>
        <span className="page-number"> 페이지 {currentPage}</span>
        <button onClick={() => handlePageChange('next')} disabled={indexOfLastTodo >= completedTodos.length}>다음</button>
      </div>

      <button className="back-to-calendar" onClick={() => navigate('/')}>캘린더로 돌아가기</button>
    </div>

  );
};

export default CompletedTodosPage;
