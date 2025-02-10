import React, { useEffect, useState } from 'react';
import configAPI from '../../services/configAPI';

const Calendar = () => {
    const [kakaoKey, setKakaoKey] = useState('');
    const [user, setUser] = useState({ memId: null });

    useEffect(() => {
        const loadKakaoSDK = async () => {
            try {
                const response = await configAPI.getConfig();
                const key = response.data.KAKAO_KEY;
                
                if (!key) {
                    console.error('Kakao key not found');
                    return;
                }

                setKakaoKey(key);

                const existingScript = document.querySelector('script[src="https://developers.kakao.com/sdk/js/kakao.min.js"]');
                
                if (!existingScript) {
                    const script = document.createElement('script');
                    script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
                    script.async = true;
                    
                    script.onload = () => {
                        if (window.Kakao && !window.Kakao.isInitialized()) {
                            window.Kakao.init(key);
                            console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
                        }
                    };

                    document.head.appendChild(script);
                } else if (window.Kakao && !window.Kakao.isInitialized()) {
                    window.Kakao.init(key);
                    console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
                }
            } catch (error) {
                console.error('Failed to load Kakao SDK:', error);
            }
        };

        if (user.memId) {
            loadKakaoSDK();
        } else {
            console.log('User is not logged in, skipping Kakao SDK initialization.');
        }

        return () => {
            if (window.Kakao?.cleanup) {
                window.Kakao.cleanup();
            }
        };
    }, [user.memId]);

    return (
        <div>
            {/* Kakao SDK 로드 및 초기화 후에 사용할 수 있는 컴포넌트 코드를 여기에 추가하세요 */}
        </div>
    );
};

export default Calendar; 