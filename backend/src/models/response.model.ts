export type Response<T> = {
    code: number;
    success: boolean;
    errorMessage?: string;
    message?: string;
    data?: T;
};