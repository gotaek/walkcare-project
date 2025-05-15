// frontend-app/utils/GlobalState.ts

let userId: string | null = null;

export function setUserId(id: string) {
  userId = id;
}

export function getUserId(): string | null {
  return userId;
}
