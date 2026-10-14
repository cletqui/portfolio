import { makeT } from "../../src/client/shared/i18n";
import type { Lang } from "../../src/client/shared/i18n";

export const makeTranslator = (lang: Lang) => makeT(lang);
