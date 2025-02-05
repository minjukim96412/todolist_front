import axios from 'axios';
import API_CONFIG from '../utils/config';
import { API_ENDPOINTS } from '../utils/constants';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 인증 관련 API
export const authAPI = {
  checkUser: (email) => 
    api.post(API_ENDPOINTS.LOGIN.CHECK_USER, { email }, { withCredentials: true }),
    
  checkNickname: (nickname) => 
    api.post(API_ENDPOINTS.LOGIN.CHECK_NICKNAME, { nickname }),
    
  saveUserInfo: (userData) => {
    const apiUrl = userData.provider === 'google' 
      ? API_ENDPOINTS.LOGIN.GOOGLE 
      : API_ENDPOINTS.LOGIN.KAKAO;
    return api.post(apiUrl, userData);
  }
};

// TODO 관련 API
export const todoAPI = {
  getCalendarTodos: (memId) => 
    api.get(API_ENDPOINTS.TODO.CALENDAR(memId)),
    
  updateTodoStatus: (todoId, completeYn) => 
    api.patch(`${API_ENDPOINTS.TODO.BASE}/${todoId}`, { completeYn }),
    
  deleteTodo: (todoId) => 
    api.delete(`${API_ENDPOINTS.TODO.BASE}/${todoId}`),

  createTodo: (todoData) =>
    api.post(API_ENDPOINTS.TODO.BASE, todoData)
};

// 설정 관련 API
export const configAPI = {
  getConfig: () => axios.get(`${API_CONFIG.BASE_URL}/config`),
};

// 사용자 관련 API
export const userAPI = {
  updateNickname: (memId, nickname) =>
    api.patch(`${API_ENDPOINTS.USER.BASE}/${memId}/nickname`, { nickname })
}; 