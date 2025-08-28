export const isObjectId = (id: string) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
