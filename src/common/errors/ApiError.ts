import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError extends HttpException {
    constructor(
        statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
        message: string,
        error?: any
    ) {
        super(
            {
                statusCode,
                message,
                error: error || null,
            },
            statusCode,
        );
    }
}
