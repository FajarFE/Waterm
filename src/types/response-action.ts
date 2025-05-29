export interface ResponseAction {
  code: number;
  success: boolean;
  message: string | string[];
  url?: string;
}
