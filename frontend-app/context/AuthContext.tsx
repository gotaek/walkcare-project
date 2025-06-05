// 경로: frontend-app/context/AuthContext.tsx
// 설명: 사용자 인증 상태를 관리하는 컨텍스트
import React, { createContext, useState, useEffect } from "react";
import { getAccessToken } from "@/utils/TokenStorage";

export const AuthContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: (value: boolean) => {},
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getAccessToken();
      setIsLoggedIn(!!token);
    };
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
