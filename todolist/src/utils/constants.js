export const API_ENDPOINTS = {
  LOGIN: {
    GOOGLE: '/login/google',
    KAKAO: '/login/kakao',
    CHECK_USER: '/login/check-user',
    CHECK_NICKNAME: '/login/check-nickname'
  },
  TODO: {
    BASE: '/todos',
    CALENDAR: (memId) => `/todos/mem/${memId}/calendar`
  },
  CONFIG: '/config'
}; 