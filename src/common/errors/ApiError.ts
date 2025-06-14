import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError extends HttpException {
    constructor(
        message: string,
        statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
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
