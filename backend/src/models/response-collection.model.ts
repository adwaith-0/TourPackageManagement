export type CollectionResponse<T> = {
    code: number;
    success: boolean;
    count?: number;
    errorMessage?: string;
    message?: string;
    data?: T[];
};
