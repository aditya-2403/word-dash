export function encryptText(plainText: string): string {
  try {
    const reversed = plainText.split('').reverse().join('');
    return btoa(encodeURIComponent(reversed));
  } catch (e) {
    return plainText;
  }
}

export function decryptText(cipherText: string): string {
  try {
    const reversed = decodeURIComponent(atob(cipherText));
    return reversed.split('').reverse().join('');
  } catch (e) {
    return cipherText;
  }
}
