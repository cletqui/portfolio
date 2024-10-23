export const queryUserAgent = async (userAgent: string) => {
  console.log(userAgent);
  const apiUrl = new URL("https://api.cybai.re/user-agent");
  apiUrl.searchParams.append("ua", userAgent);
  const response = await fetch(apiUrl);
  const data = response.json();
  return data;
};
