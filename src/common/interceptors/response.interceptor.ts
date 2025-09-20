import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  PaginationMeta,
} from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // Check if data is already in the correct format
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'status' in data &&
          'message' in data
        ) {
          // Set response status code to match the one defined in the service
          response.status(data.code);
          return data as ApiResponse<T>;
        }

        // Handle different types of responses
        let responseData: T;
        let pagination: PaginationMeta | null = null;
        let message = 'Operasi berhasil';

        if (data && typeof data === 'object') {
          // Check if data has pagination info
          if ('data' in data && 'pagination' in data) {
            responseData = data.data as T;
            pagination = data.pagination as PaginationMeta;
            message = data.message || message;
          }
          // Check if data has items array (common pagination pattern)
          else if ('items' in data && 'meta' in data) {
            responseData = data.items as T;
            const meta = data.meta as any;
            if (meta.current_page !== undefined) {
              pagination = {
                current_page: meta.current_page,
                per_page: meta.per_page,
                total: meta.total,
                last_page: meta.last_page,
              };
            }
          }
          // Check if it's a direct array response
          else if (Array.isArray(data)) {
            responseData = data as T;
            // For arrays, we could add pagination if needed
            // pagination = null; // Arrays without pagination info
          }
          // Regular object response
          else {
            responseData = data as T;
          }
        } else {
          responseData = data as T;
        }

        // Determine success status based on HTTP status code
        const isSuccess = statusCode >= 200 && statusCode < 300;

        // Set appropriate message based on HTTP method and status
        const request = context.switchToHttp().getRequest();

        const result: ApiResponse<T> = {
          code: statusCode,
          status: isSuccess,
          message,
          data: responseData,
        };

        // Only add pagination if it exists
        if (pagination) {
          result.pagination = pagination;
        }

        return result;
      }),
    );
  }
}
