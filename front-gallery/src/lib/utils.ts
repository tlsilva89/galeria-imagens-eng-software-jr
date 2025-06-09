
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sua-api.com";

export function convertUrl(src: string) {

  const caminhoCorreto = src?.startsWith('./') ? src?.slice(2) : src;
  const url = `${BASE_URL}${caminhoCorreto}`;
  return url
}