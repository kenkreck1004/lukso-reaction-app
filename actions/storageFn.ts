export function setData(key: any, text: any) {
  localStorage.setItem(key, text);
}

export function getData(key: any) {
  return localStorage.getItem(key);
}
