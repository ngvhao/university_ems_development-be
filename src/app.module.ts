import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureModule } from './modules/lecture/lecture.module';
import { MajorModule } from './modules/major/major.module';
import { ClassModule } from './modules/class/class.module';
import dataSource from 'db/data-source';
import { StudentModule } from './modules/student/student.module';
import { UserModule } from './modules/user/user.module';
import { SemesterModule } from './modules/semester/semester.module';
import { CourseModule } from './modules/course/course.module';
import { CourseSemesterModule } from './modules/course_semester/course_semester.module';
import { DepartmentModule } from './modules/department/department.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { EnrollmentCourseModule } from './modules/enrollment_course/enrollment_course.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSource.options),
    AuthModule,
    UserModule,
    StudentModule,
    LectureModule,
    MajorModule,
    FacultyModule,
    ClassModule,
    SemesterModule,
    CourseModule,
    EnrollmentCourseModule,
    CourseSemesterModule,
    DepartmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/*');
  }
}
