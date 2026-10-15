import { decodeEmail, encodeEmail } from "./email-codec";

export { decodeEmail, encodeEmail };

const ADDRESS = ["admin", "cybai.re"].join("@");

export const EMAIL_ENC = encodeEmail(ADDRESS);
export const EMAIL_MASKED = "admin [at] cybai [dot] re";
export const emailAddress = (): string => decodeEmail(EMAIL_ENC);
