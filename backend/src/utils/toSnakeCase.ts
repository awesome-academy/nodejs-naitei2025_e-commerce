export function toSnakeCaseObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCaseObject);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        toSnakeCaseObject(value),
      ])
    );
  }
  return obj;
}