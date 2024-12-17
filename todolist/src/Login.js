import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google'; // Google OAuth 컴포넌트
import axios from 'axios'; // HTTP 요청을 위한 axios
import { useNavigate } from 'react-router-dom'; // 페이지 이동
import styles from './login.module.css'; // CSS Module
import kakaoLogo from './kakao_login.png'; // Kakao 로그인 버튼 이미지

const LoginPage = () => {
  const [isNicknameModalOpen, setNicknameModalOpen] = useState(false); // 닉네임 입력 모달 상태
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
  const [nickname, setNickname] = useState(''); // 닉네임 입력 값
  const navigate = useNavigate(); // 페이지 이동 함수

  // 세션에 유저 정보가 있으면 캘린더 페이지로 리다이렉트
  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      navigate('/calendar');
    }
  }, [navigate]);

  // 사용자 정보 저장 함수
  const saveUserInfo = async (userData) => {
    try {
      const apiUrl = userData.provider === 'google'
        ? 'http://localhost:8888/api/login/google'
        : 'http://localhost:8888/api/login/kakao';
  
      await axios.post(apiUrl, userData, {
        headers: { 'Content-Type': 'application/json' },
      });

      sessionStorage.setItem('user', JSON.stringify(userData));
      alert('회원가입이 완료되었습니다.');
      setNicknameModalOpen(false); // 닉네임 모달 닫기
      navigate('/calendar'); // 캘린더 페이지로 이동
    } catch (error) {
      console.error('Error saving user info:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Google 로그인 성공 핸들러
  const handleGoogleLoginSuccess = async (response) => {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
  
    const email = decoded.email;
    const nickname = decoded.given_name;
  
    setUserInfo({
      email,
      nickname,
      tokenId: decoded.sub,
      provider: 'google',
    });
  
    const userExists = await checkIfUserExists(email);
    if (userExists.exists) {
      sessionStorage.setItem('user', JSON.stringify(userExists.user));
      navigate('/calendar');
    } else {
      setNicknameModalOpen(true);
    }
  };
  
  // Kakao 로그인 성공 핸들러
  const handleKakaoLoginSuccess = async () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert('Kakao SDK가 초기화되지 않았습니다.');
      return;
    }

    window.Kakao.Auth.login({
      success: async (response) => {
        const token = response.access_token;

        try {
          const userInfo = await window.Kakao.API.request({
            url: '/v2/user/me',
          });

          const email = userInfo.kakao_account.email;

          setUserInfo({
            email: email,
            tokenId: token,
            provider: 'kakao',
          });

          const userExists = await checkIfUserExists(email);
          if (userExists.exists) {
            sessionStorage.setItem('user', JSON.stringify(userExists.user));
            navigate('/calendar');
          } else {
            setNicknameModalOpen(true);
          }
        } catch (error) {
          console.error('Error fetching Kakao user info:', error);
          alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
        }
      },
      fail: (error) => {
        console.error('Kakao Login Failed:', error);
        alert('Kakao 로그인에 실패했습니다.');
      },
    });
  };

  // 이메일로 사용자 존재 여부 확인
  const checkIfUserExists = async (email) => {
    try {
      const response = await axios.post('http://localhost:8888/api/login/check-user', { email }, { 
        withCredentials: true  // 자격 증명 포함
      });
      if (response.data.exists) {
        const user = response.data.user; // 백엔드에서 받은 사용자 정보
        return { exists: true, user };
      }
      return { exists: false };
    } catch (error) {
      console.error('Error checking user:', error);
      return { exists: false };
    }
  };
  
  // 닉네임 입력 처리
  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  // 닉네임 제출
  const handleNicknameSubmit = async () => {
    try {
      const result = await axios.post(
        'http://localhost:8888/api/login/check-nickname',
        { nickname },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (result.data.exists) {
        alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택하세요.');
      } else {
        const userData = { ...userInfo, nickname };
        await saveUserInfo(userData);
      }
    } catch (error) {
      console.error('Error saving nickname:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Kakao SDK 로드
  useEffect(() => {
    if (!window.Kakao) {
      const script = document.createElement('script');
      script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
      script.async = true;
      script.onload = () => {
        if (window.Kakao) {
          window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
        }
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className={styles['login-container']}>
      <h1>TODO-LIST</h1>
      <h2>LOGIN</h2>

      {/* Google 로그인 버튼 */}
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => alert('Google 로그인에 실패했습니다. 다시 시도해주세요.')}
        theme="outline"
      />

      {/* Kakao 로그인 버튼 */}
      <button className={styles['kakao-login-button']} onClick={handleKakaoLoginSuccess}>
        <img src={kakaoLogo} alt="Kakao Login" width="140px" />
      </button>

      {/* 닉네임 입력 모달 */}
      {isNicknameModalOpen && (
        <div className={styles['nickname-modal']}>
          <h3>닉네임을 입력해주세요</h3>
          <input 
            type="text" 
            value={nickname} 
            onChange={handleNicknameChange} 
            placeholder="닉네임 입력"
          />
          <button onClick={handleNicknameSubmit}>회원가입</button>
          <button className="cancel" onClick={() => setNicknameModalOpen(false)}>취소</button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
