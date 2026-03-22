import type { Locale } from "./config"
import en from "./dictionaries/en.json"
import es from "./dictionaries/es.json"

const dictionaries = {
  en,
  es,
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]
}
