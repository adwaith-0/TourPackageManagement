export class ValidationUtil {
    static isNonEmptyString(value: unknown): value is string {
        return typeof value === 'string' && value.trim().length > 0;
    }

    static isNonNegativeInteger(value: unknown): value is number {
        return typeof value === 'number' && Number.isInteger(value) && value >= 0;
    }

    static isStringArray(value: unknown): value is string[] {
        return Array.isArray(value) && value.every((item) => ValidationUtil.isNonEmptyString(item));
    }

    static isObject(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
}
