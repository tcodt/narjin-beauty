export interface SlotsResponse {
  id: number;
  date: string;
  start_time: string;
  end_time?: string;
  is_available: boolean;
  service: number;
}

export interface SlotsRequest {
  date: string; // Gregorian YYYY-MM-DD
  start_time: string; // HH:mm:ss
  is_available: boolean;
  service_id: number;
}
