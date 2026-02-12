export function parseJwtTtl(ttl: string): number {
  // Если это число в строке
  if (!isNaN(Number(ttl))) {
    return Number(ttl);
  }

  // Парсинг строк типа "15m", "2h", "7d"
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (match) {
    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 60 * 60;
      case 'd':
        return num * 60 * 60 * 24;
    }
  }

  // Если формат неизвестен, возвращаем дефолтное значение (1 час)
  console.warn(
    `Неизвестный формат JWT TTL: ${ttl}. Используется значение по умолчанию: 3600 секунд`,
  );
  return 3600;
}
