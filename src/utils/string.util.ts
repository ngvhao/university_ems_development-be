import slugify from 'slugify';

export class StringUtil {
  static generateRandom(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let index = 0; index < length; index++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }

  static isEmpty(string_: string | null | undefined): boolean {
    return !string_ || string_.trim().length === 0;
  }

  static generateRandomFileName(originalName: string, length: number): string {
    const randomString = StringUtil.generateRandom(length);
    return slugify(`${randomString} ${originalName}`);
  }

  static convertToStringObject(values: object) {
    return Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value == null ? value : String(value).trim(),
      ]),
    );
  }
}
