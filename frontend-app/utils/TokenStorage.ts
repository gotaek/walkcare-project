// 경로: frontend-app/utils/TokenStorage.ts
// 설명: 액세스 토큰을 AsyncStorage에 저장, 가져오기, 삭제하는 유틸리티 함수들

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAccessToken = async (token: string) => {
  await AsyncStorage.setItem('access_token', token);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('access_token');
};

export const removeAccessToken = async () => {
  await AsyncStorage.removeItem('access_token');
};
