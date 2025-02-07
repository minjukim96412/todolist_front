import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { todoAPI } from "../../services/api"; // API 호출을 위한 todoAPI import

const CompletedTodosPage = () => {
  const [completedTodos, setCompletedTodos] = useState([]);
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

        // ✅ completeYn이 true인 일정만 필터링
        const completed = allTodos.filter(todo => todo.completeYn);
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

  return (
    <div>
      <h2>완료된 일정</h2>
      {completedTodos.length > 0 ? (
        <ul>
          {completedTodos.map(todo => (
            <li key={todo.todoId}>
              {todo.title} - 시작: {new Date(todo.startDate).toLocaleString("ko-KR")} - 종료: {new Date(todo.endDate).toLocaleString("ko-KR")}
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
      <button onClick={() => navigate('/')}>캘린더로 돌아가기</button>
    </div>
  );
};


export default CompletedTodosPage;
