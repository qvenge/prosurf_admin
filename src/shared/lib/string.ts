export function capitalize(value: string, onlyFirstLetter = false): string {
  if (onlyFirstLetter) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  return value.replace(/\b\w/g, c => c.toUpperCase());
}

export function pluralize(count: number, [one, few, many]: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) {
    return many;
  }
  if (n1 > 1 && n1 < 5) {
    return few;
  }
  if (n1 === 1) {
    return one;
  }
  return many;
};

export function camelToSnake(value: string): string {
  return value
    // 1. Найти переход "маленькая буква или цифра" + "большая буква"
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    // 2. Найти последовательности заглавных букв, если за ними следует обычная буква (getURLResponse -> get_URL_Response)
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    // 3. Перевести всю строку в нижний регистр
    .toLowerCase();
}

export function dashirize(value: string): string {
  return value
    // 1. Вставляем дефис между маленькой буквой/цифрой и большой буквой
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // 2. Вставляем дефис между последовательностью заглавных и следующей Большой+маленькой
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // 3. Меняем все подчёркивания и пробелы на дефисы
    .replace(/[_\s]+/g, '-')
    // 4. Переводим в нижний регистр
    .toLowerCase();
}

export function camelize(value: string): string {
  return value
    .toLowerCase() // всё в нижний регистр для однозначности
    .replace(/[-_]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '')
    .replace(/^./, match => match.toUpperCase()); // делаем первую букву заглавной
}

export const getAbbr = (name: string) =>
  name.split(' ').slice(0, 2).map((word) =>
    word[0].toUpperCase()).join('');