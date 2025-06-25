import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturerModule } from './modules/lecturer/lecturer.module';
import { MajorModule } from './modules/major/major.module';
import { ClassModule } from './modules/class/class.module';
import dataSource from 'db/data-source';
import { StudentModule } from './modules/student/student.module';
import { UserModule } from './modules/user/user.module';
import { SemesterModule } from './modules/semester/semester.module';
import { CourseModule } from './modules/course/course.module';
import { DepartmentModule } from './modules/department/department.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { EnrollmentCourseModule } from './modules/enrollment_course/enrollment_course.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { StudyPlanModule } from './modules/study_plan/study_plan.module';
import { CurriculumCourseModule } from './modules/curriculum_course/curriculum_course.module';
import { RoomModule } from './modules/room/room.module';
import { ClassGroupModule } from './modules/class_group/class_group.module';
import { FacultyRegistrationScheduleModule } from './modules/faculty_registration_schedule/faculty_registration_schedule.module';
import { ClassAdjustmentScheduleModule } from './modules/class_adjustment_schedule/class_adjustment_schedule.module';
import { TimeSlotModule } from './modules/time_slot/time_slot.module';
import { ClassWeeklyScheduleModule } from './modules/class_weekly_schedule/class_weekly_schedule.module';
import { HttpModule } from '@nestjs/axios';
import { LecturerCourseModule } from './modules/lecturer_course/lecturer_course.module';
import { TuitionModule } from './modules/tuition/tuition.module';
import { TuitionDetailModule } from './modules/tuition_detail/tuition_detail.module';
import { PaymentTransactionModule } from './modules/payment_transaction/payment_transaction.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SettingModule } from './modules/setting/setting.module';
import { NotificationModule } from './modules/notification/notification.module';
import { NotificationRecipientModule } from './modules/notification_recipient/notification_recipient.module';
import { NotificationRuleModule } from './modules/notification_audience_rule/notification_audience_rule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSource.options),
    AuthModule,
    UserModule,
    StudentModule,
    LecturerModule,
    MajorModule,
    FacultyModule,
    ClassModule,
    SemesterModule,
    CourseModule,
    EnrollmentCourseModule,
    DepartmentModule,
    CurriculumModule,
    StudyPlanModule,
    CurriculumCourseModule,
    RoomModule,
    ClassGroupModule,
    FacultyRegistrationScheduleModule,
    ClassWeeklyScheduleModule,
    ClassAdjustmentScheduleModule,
    TimeSlotModule,
    HttpModule,
    LecturerCourseModule,
    TuitionModule,
    TuitionDetailModule,
    PaymentTransactionModule,
    PaymentModule,
    SettingModule,
    NotificationModule,
    NotificationRuleModule,
    NotificationRecipientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/*');
  }
}
