/**
 * Utility to map between camelCase (Frontend/TypeScript) and snake_case (Postgres/Supabase)
 */

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Maps an object's keys from camelCase to snake_case
 */
export function mapToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[toSnakeCase(key)] = obj[key];
    }
  }
  return result;
}

/**
 * Maps an object's keys from snake_case to camelCase
 */
export function mapToCamelCase(obj: Record<string, any>): Record<string, any> {
  if (!obj) return obj;
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[toCamelCase(key)] = obj[key];
    }
  }
  return result;
}

/**
 * Maps an array of objects' keys from snake_case to camelCase
 */
export function mapArrayToCamelCase(arr: any[]): any[] {
  if (!arr) return [];
  return arr.map(mapToCamelCase);
}
