export class CourseHelper {
  static getTotalSessionPerSemester(credits: number): number {
    if (credits <= 2) {
      return 5;
    } else if (credits === 3) {
      return 10;
    } else if (credits === 4) {
      return 12;
    } else if (credits === 5) {
      return 15;
    }
    return 1;
  }
}
