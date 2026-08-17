export type SkinType = '건성' | '지성' | '복합성' | '수부지';

export type User = {
  id: number;
  nickname: string;
  age: number;
  skinType: {
    type: SkinType;
  };
};

type UserResponse = {
  user: User;
};

// Android 에뮬레이터에서 내 컴퓨터의 백엔드 서버에 접속하는 주소입니다.
// 백엔드 포트가 다르거나 실제 기기에서 테스트할 때는 이 주소만 변경하세요.
export const API_BASE_URL = 'http://10.0.2.2:8080';

export async function getUser(userId: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`);

  if (!response.ok) {
    throw new Error('사용자 정보를 불러오지 못했습니다.');
  }

  const data = (await response.json()) as UserResponse;
  return data.user;
}
