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
