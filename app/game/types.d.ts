export interface DailyWordResponse {
  success: boolean;
  data: {
    _id: string;
    dataIndex: number;
    word: string;
  };
}

export interface ValidateWordRequest {
  word: string;
}

export interface ValidateWordResponse {
  success: boolean;
  isValid: boolean;
  message?: string;
}
