export const API_ENDPOINTS = {
  LOGIN: {
    GOOGLE: '/login/google',
    KAKAO: '/login/kakao',
    CHECK_USER: '/login/check-user',
    CHECK_NICKNAME: '/login/check-nickname',
    UPDATE_NICKNAME: (memId) => `/login/update-nickname/${memId}`
  },
  TODO: {
    BASE: '/todos',
    CALENDAR: (memId) => `/todos/mem/${memId}/calendar`,
    COMPLETED: (memId) => `/todos/completed/${memId}`
  },

  CONFIG: '/config'
}; 