import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google'; // Google OAuth 컴포넌트
import { useNavigate } from 'react-router-dom'; // 페이지 이동
import '../../styles/login.css';  // .module.css 에서 일반 .css로 변경
import kakaoLogo from '../../assets/kakao_login.png'; // Kakao 로그인 버튼 이미지
import { authAPI } from '../../services/api';

import API_CONFIG from '../../utils/config';

const LoginPage = ({ kakaoClientId }) => {
  const [isNicknameModalOpen, setNicknameModalOpen] = useState(false); // 닉네임 입력 모달 상태
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
  const [nickname, setNickname] = useState(''); // 닉네임 입력 값
  const navigate = useNavigate(); // 페이지 이동 함수

  // Kakao SDK 로드
  useEffect((kakaoKey) => {
    console.log("📌 Kakao SDK 로드 시작");
    console.log("📌 Kakao Key:", kakaoKey); // ✅ Client ID 확인
    if (!kakaoClientId) {
      console.error("❌ Kakao Client ID가 설정되지 않았습니다.");
      return; // ✅ Client ID가 없으면 초기화 실행 안 함
    }
  
    if (!window.Kakao) {
      console.log("📌 Kakao SDK가 존재하지 않음 → 스크립트 추가");
  
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.js"; 
      script.async = true;
      script.onload = () => {
        console.log("✅ Kakao SDK 스크립트 로드 완료");
  
        if (window.Kakao) {
          console.log("📌 Kakao 객체 존재, 초기화 상태:", window.Kakao.isInitialized());
  
          if (!window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoClientId);
            console.log("✅ Kakao SDK 초기화 완료:", window.Kakao.isInitialized());
          } else {
            console.warn("❗ Kakao SDK가 이미 초기화됨");
          }
        } else {
          console.error("❌ Kakao 객체가 존재하지 않습니다.");
        }
      };
  
      document.body.appendChild(script);
    } else {
      console.log("📌 Kakao SDK 이미 로드됨, 초기화 상태:", window.Kakao.isInitialized());
  
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoClientId);
        console.log("✅ Kakao SDK 초기화 완료:", window.Kakao.isInitialized());
      } else {
        console.warn("❗ Kakao SDK가 이미 초기화됨");
      }
    }
  }, [kakaoClientId]);
  

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
      await authAPI.saveUserInfo(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      alert('회원가입이 완료되었습니다.');
      setNicknameModalOpen(false);
      navigate('/calendar');
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
    console.log(window.Kakao);
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
      const response = await authAPI.checkUser(email);
      if (response.data.exists) {
        return { exists: true, user: response.data.user };
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
      const result = await authAPI.checkNickname(nickname);

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

  

  return (
    <div className="login-container">
      <h1>TODO-LIST</h1>
      <h2>LOGIN</h2>

      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => alert('Google 로그인에 실패했습니다. 다시 시도해주세요.')}
        theme="outline"
      />

      <button className="kakao-login-button" onClick={handleKakaoLoginSuccess}>
        <img src={kakaoLogo} alt="Kakao Login" width="140px" />
      </button>

      {isNicknameModalOpen && (
        <div className="nickname-modal">
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
