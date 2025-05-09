import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EFacultyCode } from '../enums/faculty.enum';

export class StudentHelper {
  /**
   * Tạo mã sinh viên duy nhất sử dụng giao dịch để đảm bảo tính đồng thời.
   * @param dataSource - Kết nối đến database.
   * @param facultyCode - Mã khoa (ví dụ: CNTT).
   * @param academicYear - Khóa học (ví dụ: 2024).
   * @param majorId - ID chuyên ngành.
   * @returns Promise<string> - Mã sinh viên được tạo.
   */
  static async generateStudentCode(
    dataSource: DataSource,
    facultyCode: string,
    academicYear: number,
    majorId: number,
  ): Promise<string> {
    const seqName = `student_code_seq_${academicYear}_${majorId}`;

    await this.ensureSequenceExists(dataSource, academicYear, majorId);

    try {
      const result = await dataSource.query(`SELECT nextval($1) as seq`, [
        seqName,
      ]);
      const seqNumber = result[0]?.seq;
      if (!seqNumber) {
        throw new InternalServerErrorException(
          'Không thể lấy giá trị từ sequence.',
        );
      }

      const yearCode = academicYear.toString().slice(-2);
      const indexStr = seqNumber.toString().padStart(5, '0');

      return `${EFacultyCode[facultyCode]}${yearCode}${indexStr}`;
    } catch (error) {
      console.error(`Lỗi khi lấy giá trị sequence: ${error.message}`);
      throw new InternalServerErrorException(
        `Không thể tạo mã sinh viên cho năm học ${academicYear} và chuyên ngành ${majorId}.`,
      );
    }
  }

  /**
   * Đảm bảo sequence tồn tại cho mỗi năm và mỗi ngành.
   * @param dataSource - Kết nối đến database.
   * @param year - Năm học.
   * @param majorId - ID chuyên ngành.
   */
  static async ensureSequenceExists(
    dataSource: DataSource,
    year: number,
    majorId: number,
  ): Promise<void> {
    if (!Number.isInteger(year) || year < 2000 || year > 3000) {
      throw new InternalServerErrorException(`Năm học không hợp lệ: ${year}`);
    }
    if (!Number.isInteger(majorId) || majorId <= 0) {
      throw new InternalServerErrorException(
        `ID chuyên ngành không hợp lệ: ${majorId}`,
      );
    }

    const seqName = `student_code_seq_${year}_${majorId}`;

    try {
      const query = `
        CREATE SEQUENCE IF NOT EXISTS ${this.quoteIdentifier(seqName)}
        START WITH 1
        INCREMENT BY 1
        MINVALUE 1
        NO CYCLE;
      `;
      await dataSource.query(query);
      console.log(`Sequence ${seqName} đã được đảm bảo tồn tại.`);
    } catch (error) {
      console.error(`Không thể tạo sequence ${seqName}: ${error.message}`);
      throw new InternalServerErrorException(
        `Không thể tạo sequence cho năm học ${year}, chuyên ngành ${majorId}.`,
      );
    }
  }

  /**
   * Trích dẫn an toàn cho định danh SQL.
   * @param identifier - Tên định danh.
   * @returns Tên đã được quote.
   */
  static quoteIdentifier(identifier: string): string {
    if (identifier.length > 63) {
      throw new InternalServerErrorException(
        `Tên sequence quá dài: ${identifier}`,
      );
    }
    return `"${identifier.replace(/"/g, '""')}"`;
  }
}
