# University EMS - Mermaid Class Diagram

```mermaid
classDiagram

class FacultyEntity {
  +int id
  +string facultyCode
  +string name
  +string description
  +getFacultyById(id): FacultyEntity
  +getAllFaculties(): FacultyEntity[]
}
class DepartmentEntity {
  +int id
  +string departmentCode
  +string name
  +int facultyId
  +getDepartmentById(id): DepartmentEntity
  +getDepartmentsByFaculty(facultyId): DepartmentEntity[]
  +getOne(condition, relations?): DepartmentEntity
}
class MajorEntity {
  +int id
  +string majorCode
  +string name
  +int departmentId
  +getMajorById(id): MajorEntity
  +getMajorCountByDepartmentId(departmentId): int
}
class ClassEntity {
  +int id
  +string classCode
  +int yearOfAdmission
  +int majorId
  +int homeroomLecturerId
  +getClassById(id): ClassEntity
  +getClassesByMajor(majorId): ClassEntity[]
}
class LecturerEntity {
  +int id
  +int userId
  +int departmentId
  +EAcademicRank academicRank
  +string specialization
  +bool isHeadOfFaculty
  +getLecturerById(id): LecturerEntity
  +getLecturersByDepartment(departmentId): LecturerEntity[]
}
class UserEntity {
  +int id
  +string universityEmail
  +string personalEmail
  +string password
  +string firstName
  +string lastName
  +string avatarUrl
  +EUserRole role
  +string phoneNumber
  +string identityCardNumber
  +date dateOfBirth
  +string gender
  +string hometown
  +string permanentAddress
  +string temporaryAddress
  +string nationality
  +string ethnicity
  +EAccountStatus isActive
  +string resetPasswordToken
  +getUserById(id): UserEntity
  +getUserByPersonalEmail(email): UserEntity
  +getUserByUniEmail(email): UserEntity
}
class StudentEntity {
  +int id
  +string studentCode
  +int academicYear
  +float gpa
  +EStudentStatus status
  +date enrollmentDate
  +date expectedGraduationDate
  +int userId
  +int majorId
  +int classId
  +getOneByUserId(userId): StudentEntity
  +getStudentByStudentCode(code): StudentEntity
  +getStudentsByClass(classId): StudentEntity[]
  +getChatbotData(studentId): StudentChatbotDataDto
  +createStudent(studentDTO): Partial<StudentEntity>
  +update(id, updateDto): Partial<StudentEntity>
}
class CourseEntity {
  +int id
  +string courseCode
  +string name
  +int credit
  +string description
  +ECourseType courseType
  +getCourseById(id): CourseEntity
  +getCoursesByType(type): CourseEntity[]
}
class ClassGroupEntity {
  +int id
  +int groupNumber
  +int maxStudents
  +int registeredStudents
  +EClassGroupStatus status
  +int lecturerId
  +int semesterId
  +int courseId
  +getClassGroupById(id): ClassGroupEntity
  +getClassGroupsForRegistration(...): ClassGroupEntity[]
}
class EnrollmentCourseEntity {
  +int id
  +EEnrollmentStatus status
  +date enrollmentDate
  +int studentId
  +int classGroupId
  +getEnrollmentById(id): EnrollmentCourseEntity
}
class StudyPlanEntity {
  +int id
  +EStudyPlanStatus status
  +int studentId
  +int semesterId
  +int courseId
  +getStudyPlanById(id): StudyPlanEntity
  +create(createStudyPlanDto, currentUser, registerSemesterId): StudyPlanEntity[]
  +findAll(...): { data: StudyPlanEntity[], meta: any }
}
class SemesterEntity {
  +int id
  +string semesterCode
  +int startYear
  +int endYear
  +int term
  +date startDate
  +date endDate
  +getSemesterById(id): SemesterEntity
  +getCurrentSemester(): string
}
class RoomEntity {
  +int id
  +string roomNumber
  +string buildingName
  +string floor
  +ERoomType roomType
  +int capacity
  +getRoomById(id): RoomEntity
  +getFreeClassroom(date): RoomWithFreeTimeSlots[]
}
class SettingEntity {
  +int id
  +string key
  +any value
  +string description
  +getSettingFromCache(key): any
  +getCurrentSemester(): string
}
class TuitionEntity {
  +int id
  +decimal totalAmountDue
  +decimal amountPaid
  +decimal balance
  +ETuitionStatus status
  +date dueDate
  +string notes
  +getTuitionsByStudent(studentId): TuitionEntity[]
  +getTuitionsBySemester(semesterId): TuitionEntity[]
  +create(createTuitionDto): TuitionEntity
  +createTuitionsForStudentBatch(createTuitionsBatchDto): void
}
class TuitionDetailEntity {
  +int id
  +int tuitionId
  +int enrollmentId
  +decimal amount
  +int numberOfCredits
  +decimal pricePerCredit
  +getTotalAmountForTuition(tuitionId): number
}
class GradeDetailEntity {
  +int id
  +EGradeType gradeType
  +float score
  +float weight
  +string letterGrade
  +string notes
  +int studentId
  +int classGroupId
  +int enrollmentId
  +getGradeSummary(studentId, classGroupId): { gradeDetails, weightedAverage, totalWeight }
}
class ClassWeeklyScheduleEntity {
  +int id
  +EDayOfWeek dayOfWeek
  +int classGroupId
  +int roomId
  +int timeSlotId
  +date startDate
  +date endDate
  +int lecturerId
  +string[] scheduledDates
  +getTodayScheduleByStudentId(studentId): any
  +getScheduleByStudentId(studentId): any
  +getScheduleByLecturerId(lecturerId): any
  +find(condition, relations?): ClassWeeklyScheduleEntity[]
}
class ClassAdjustmentScheduleEntity {
  +int id
  +date adjustmentDate
  +string note
  +EAdjustmentType type
  +EClassAdjustmentScheduleStatus status
  +int classGroupId
  +int roomId
  +int timeSlotId
}
class TimeSlotEntity {
  +int id
  +string startTime
  +string endTime
  +int shift
}
class ExamScheduleEntity {
  +int id
  +EExamType examType
  +date examDate
  +string startTime
  +string endTime
  +string notes
  +int classGroupId
  +int roomId
  +int semesterId
  +create(createExamScheduleDto): ExamScheduleEntity
}
class NotificationEntity {
  +int id
  +string title
  +string content
  +ENotificationType notificationType
  +ENotificationPriority priority
  +int createdByUserId
  +int semesterId
  +string[] attachments
  +ENotificationStatus status
  +create(createNotificationDto, createdByUserId): NotificationEntity
  +update(id, updateNotificationDto): NotificationEntity
}
class NotificationRecipientEntity {
  +int id
  +int notificationId
  +int recipientUserId
  +date receivedAt
  +ERecipientStatus status
  +date readAt
  +date dismissedAt
  +bool isPinned
  +getUnreadCount(userId): number
  +getRecipientsOfNotification(notificationId): NotificationRecipientEntity[]
}
class NotificationAudienceRuleEntity {
  +int id
  +int notificationId
  +EAudienceType audienceType
  +string audienceValue
  +EConditionLogic conditionLogic
}
class FacultyRegistrationScheduleEntity {
  +int id
  +int facultyId
  +int semesterId
  +date preRegistrationStartDate
  +date preRegistrationEndDate
  +date registrationStartDate
  +date registrationEndDate
  +EFacultyRegistrationScheduleStatus status
}
class CurriculumCourseEntity {
  +int id
  +bool isMandatory
  +decimal minGradeRequired
  +int curriculumId
  +int courseId
  +int semesterId
  +int prerequisiteCourseId
  +getOne(condition, relations?): CurriculumEntity
}
class CurriculumEntity {
  +int id
  +int totalCreditsRequired
  +int electiveCreditsRequired
  +date effectiveDate
  +date expiryDate
  +int startAcademicYear
  +int endAcademicYear
  +int majorId
  +getOne(condition, relations?): CurriculumEntity
}
class CourseFacultyEntity {
  +int id
  +int courseId
  +int facultyId
}
class PaymentTransactionEntity {
  +int id
  +int tuitionId
  +decimal amount
  +date paidAt
  +string paymentMethod
  +string transactionId
  +string status
  +create(createDto): PaymentTransactionEntity
  +update(id, updateDto): PaymentTransactionEntity
}
class LecturerCourseEntity {
  +int id
  +int lecturerId
  +int courseId
}

FacultyEntity "1" o-- "many" DepartmentEntity : departments
DepartmentEntity "1" o-- "many" MajorEntity : majors
DepartmentEntity "1" o-- "many" LecturerEntity : lecturers
MajorEntity "1" o-- "many" ClassEntity : classes
MajorEntity "1" o-- "many" StudentEntity : students
MajorEntity "1" o-- "many" CurriculumEntity : curriculums
ClassEntity "1" o-- "many" StudentEntity : students
LecturerEntity "1" o-- "many" ClassEntity : classes
UserEntity "1" o-- "1" StudentEntity : student
UserEntity "1" o-- "1" LecturerEntity : lecturer
StudentEntity "1" o-- "many" StudyPlanEntity : studyPlans
StudentEntity "1" o-- "many" EnrollmentCourseEntity : enrollments
StudentEntity "1" o-- "many" TuitionEntity : tuitions
StudentEntity "1" o-- "many" GradeDetailEntity : gradeDetails
CourseEntity "1" o-- "many" ClassGroupEntity : classGroups
CourseEntity "1" o-- "many" CurriculumCourseEntity : curriculumCourses
CourseEntity "1" o-- "many" StudyPlanEntity : studyPlans
ClassGroupEntity "1" o-- "many" EnrollmentCourseEntity : enrollments
ClassGroupEntity "1" o-- "many" ExamScheduleEntity : examSchedules
ClassGroupEntity "1" o-- "many" GradeDetailEntity : gradeDetails
EnrollmentCourseEntity "1" o-- "many" TuitionDetailEntity : tuitionDetails
EnrollmentCourseEntity "1" o-- "many" GradeDetailEntity : gradeDetails
StudyPlanEntity "1" o-- "1" SemesterEntity : semester
StudyPlanEntity "1" o-- "1" CourseEntity : course
SemesterEntity "1" o-- "many" StudyPlanEntity : studyPlans
SemesterEntity "1" o-- "many" CurriculumCourseEntity : curriculumCourses
SemesterEntity "1" o-- "many" ClassGroupEntity : classGroups
SemesterEntity "1" o-- "many" TuitionEntity : tuitions
SemesterEntity "1" o-- "many" NotificationEntity : notifications
SemesterEntity "1" o-- "many" ExamScheduleEntity : examSchedules
RoomEntity "1" o-- "many" ClassWeeklyScheduleEntity : classWeeklySchedules
RoomEntity "1" o-- "many" ClassAdjustmentScheduleEntity : classAdjustmentSchedules
RoomEntity "1" o-- "many" ExamScheduleEntity : examSchedules
NotificationEntity "1" o-- "many" NotificationRecipientEntity : recipients
NotificationEntity "1" o-- "many" NotificationAudienceRuleEntity : audienceRules
NotificationRecipientEntity "1" o-- "1" UserEntity : recipientUser
NotificationAudienceRuleEntity "1" o-- "1" NotificationEntity : notification
FacultyEntity "1" o-- "many" FacultyRegistrationScheduleEntity : registrationSchedules
CurriculumEntity "1" o-- "many" CurriculumCourseEntity : curriculumCourses
CourseEntity "1" o-- "many" LecturerCourseEntity : lecturerCourses
LecturerEntity "1" o-- "many" LecturerCourseEntity : lecturerCourses
CourseEntity "1" o-- "many" CourseFacultyEntity : courseFaculties
FacultyEntity "1" o-- "many" CourseFacultyEntity : courseFaculties
TuitionEntity "1" o-- "many" TuitionDetailEntity : details
TuitionEntity "1" o-- "many" PaymentTransactionEntity : paymentTransactions
```
