export interface RoomCreateRequest {
  name: string;
  maxCapacity: number | null;
  isPrivate: boolean;
}
