const pick = <T extends Record<string, unknown>, k extends keyof T>(
  obj: T,
  keys: k[]
): Partial<T> => {
  // console.log(obj, keys);
  const finalObject: Partial<T> = {};
  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      console.log(key);
      finalObject[key] = obj[key];
    }
  }
  console.log(finalObject);
  return finalObject;
};

export default pick;
