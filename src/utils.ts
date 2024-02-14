import axios from "axios";

export function logError(error: any, errorMessagePrefix: string) {
  if (axios.isAxiosError(error)) {
    console.error(errorMessagePrefix, error.code, error.message);
  } else if (error instanceof Error) {
    console.error(errorMessagePrefix, error.message);
  } else {
    console.error(errorMessagePrefix, error);
  }
}
