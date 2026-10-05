import { HttpContextToken, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { map, OperatorFunction } from 'rxjs';
import { ApiError, ApiResponse } from '../models/api-response.model';

/** Bật cờ này trên request để interceptor KHÔNG tự hiện toast lỗi (component tự xử lý) */
export const SILENT_ERROR = new HttpContextToken<boolean>(() => false);

/** Bóc lớp { success, message, data } → data */
export function unwrap<T>(): OperatorFunction<ApiResponse<T>, T> {
  return map((res) => res.data);
}

/** Loại bỏ giá trị rỗng trước khi đưa vào query string */
export function toParams(filter: object = {}): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend Laravel đã chạy chưa.',
  400: 'Yêu cầu không hợp lệ.',
  401: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  422: 'Dữ liệu không hợp lệ.',
  429: 'Bạn thao tác quá nhanh, vui lòng thử lại sau.',
  500: 'Lỗi máy chủ, vui lòng thử lại sau.',
};

/** Chuẩn hóa HttpErrorResponse → ApiError với message tiếng Việt */
export function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const body = err.error && typeof err.error === 'object' ? err.error : {};
    const fallback = STATUS_MESSAGES[err.status] ?? (err.status >= 500 ? STATUS_MESSAGES[500] : 'Đã xảy ra lỗi.');
    return {
      status: err.status,
      message: err.status === 0 ? STATUS_MESSAGES[0] : body.message || fallback,
      errors: body.errors || {},
    };
  }
  return { status: -1, message: 'Đã xảy ra lỗi không xác định.', errors: {} };
}

/** Lấy lỗi validate đầu tiên (hoặc message chung) để hiển thị */
export function firstError(error: ApiError): string {
  const first = Object.values(error.errors ?? {})[0];
  return first?.[0] ?? error.message;
}
