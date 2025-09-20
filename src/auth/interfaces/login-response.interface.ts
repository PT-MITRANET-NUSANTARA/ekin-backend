export interface IdasnResponseDto {
  success: boolean;
  message: string;
  mapData: {
    redirect_uri: string;
  };
}
