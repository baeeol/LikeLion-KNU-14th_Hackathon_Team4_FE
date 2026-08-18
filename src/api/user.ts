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

// 가비아에 배포된 백엔드 서버의 공통 주소입니다.
// 모든 API 요청은 이 주소 뒤에 엔드포인트를 붙여 호출합니다.
export const API_BASE_URL = 'http://1.201.117.50:3000';

export async function getUser(userId: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`);

  if (!response.ok) {
    throw new Error('사용자 정보를 불러오지 못했습니다.');
  }

  const data = (await response.json()) as UserResponse;
  return data.user;
}
