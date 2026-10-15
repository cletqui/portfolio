export const encodeEmail = (address: string): string => btoa([...address].reverse().join(""));
export const decodeEmail = (encoded: string): string => [...atob(encoded)].reverse().join("");
