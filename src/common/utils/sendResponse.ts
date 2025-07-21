import { HttpStatus } from '@nestjs/common';

export const sendResponse = <T>(
  message,
  data: T,
  statusCode = HttpStatus.OK,
  success = true,
) => {
  return {
    statusCode,
    success,
    message,
    data,
  };
};
