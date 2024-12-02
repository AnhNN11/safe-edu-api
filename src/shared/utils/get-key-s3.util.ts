export function getKeyS3(urlS3: string): string {
  const key = urlS3.split('amazonaws.com/')[1]; // Tách theo amazonaws.com/
  return key; // Trả về key đã lấy được
}
