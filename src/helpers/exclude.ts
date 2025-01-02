export function exclude<T, Key extends keyof T>(
  model: T,
  keys: Key[],
): Omit<T, Key> {
  const result = { ...model };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}
