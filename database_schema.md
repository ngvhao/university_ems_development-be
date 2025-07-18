# Database Schema - University EMS System

```mermaid
erDiagram
    %% Core User Management
    users {
        int id PK
        string universityEmail UK
        string personalEmail
        string password
        string firstName
        string lastName
        string avatarUrl
        enum role
        string phoneNumber
        string identityCardNumber
        date dateOfBirth
        string gender
        string hometown
        text permanentAddress
        text temporaryAddress
        string nationality
        string ethnicity
        enum isActive
        string resetPasswordToken
    }

    %% Academic Structure
    faculties {
        int id PK
        string facultyCode UK
        string name
        text description
    }

    departments {
        int id PK
        string departmentCode UK
        string name
        int facultyId FK
    }

    majors {
        int id PK
        string majorCode UK
        string name
        int departmentId FK
    }

    classes {
        int id PK
        string classCode UK
        int yearOfAdmission
        int majorId FK
        int homeroomLecturerId FK
    }

    %% Academic Entities
    students {
        int id PK
        string studentCode UK
        int academicYear
        float gpa
        enum status
        date enrollmentDate
        date expectedGraduationDate
        int userId FK
        int majorId FK
        int classId FK
    }

    lecturers {
        int id PK
        int userId FK UK
        int departmentId FK
        enum academicRank
        string specialization
        boolean isHeadDepartment
    }

    %% Course Management
    courses {
        int id PK
        string courseCode UK
        string name
        int credits
        enum courseType
        text description
        boolean isActive
    }

    semesters {
        int id PK
        string semesterCode UK
        string name
        int academicYear
        date startDate
        date endDate
        enum status
    }

    class_groups {
        int id PK
        int groupNumber
        int maxStudents
        int registeredStudents
        enum status
        int lecturerId FK
        int semesterId FK
        int courseId FK
    }

    %% Enrollment and Grades
    enrollment_courses {
        int id PK
        enum status
        timestamp enrollmentDate
        int studentId FK
        int classGroupId FK
    }

    grade_details {
        int id PK
        enum gradeType
        decimal grade
        text comment
        int studentId FK
        int classGroupId FK
        int enrollmentId FK
    }

    %% Study Plans and Curriculum
    curriculums {
        int id PK
        int totalCreditsRequired
        int electiveCreditsRequired
        date effectiveDate
        date expiryDate
        int startAcademicYear
        int endAcademicYear
        int majorId FK
    }

    curriculum_courses {
        int id PK
        boolean isMandatory
        decimal minGradeRequired
        int curriculumId FK
        int courseId FK
        int semesterId FK
        int prerequisiteCourseId FK
    }

    study_plans {
        int id PK
        enum status
        int studentId FK
        int semesterId FK
        int courseId FK
    }

    %% Scheduling
    time_slots {
        int id PK
        time startTime
        time endTime
        int shift
    }

    rooms {
        int id PK
        string roomNumber
        string buildingName
        string floor
        enum roomType
        int capacity
    }

    class_weekly_schedules {
        int id PK
        enum dayOfWeek
        int classGroupId FK
        int roomId FK
        int timeSlotId FK
        date startDate
        date endDate
        int lecturerId
        string[] scheduledDates
    }

    class_adjustment_schedules {
        int id PK
        timestamp adjustmentDate
        text note
        enum type
        enum status
        int classGroupId FK
        int roomId FK
        int timeSlotId FK
    }

    exam_schedules {
        int id PK
        enum examType
        timestamp examDate
        time startTime
        time endTime
        text notes
        int classGroupId FK
        int roomId FK
        int semesterId FK
    }

    %% Tuition and Payments
    tuitions {
        int id PK
        int studentId FK
        int semesterId FK
        enum tuitionType
        string description
        timestamp issueDate
        decimal totalAmount
        enum status
    }

    tuition_details {
        int id PK
        int tuitionId FK
        int enrollmentId FK
        decimal amount
        int numberOfCredits
        decimal pricePerCredit
    }

    payment_transactions {
        int id PK
        int tuitionId FK
        string transId UK
        decimal amountPaid
        timestamp paymentDate
        enum paymentMethod
        enum status
        int processedByUserId FK
        text notes
        string failStatus
    }

    %% Notifications
    notifications {
        int id PK
        string title
        text content
        enum notificationType
        enum priority
        int createdByUserId FK
        int semesterId FK
        string[] attachments
        enum status
    }

    notification_audience_rules {
        int id PK
        int notificationId FK
        enum audienceType
        string audienceValue
        enum conditionLogic
    }

    notification_recipients {
        int id PK
        int notificationId FK
        int recipientUserId FK
        timestamp receivedAt
        enum status
        timestamp readAt
        timestamp dismissedAt
        boolean isPinned
    }

    %% Faculty Registration Schedules
    faculty_registration_schedules {
        int id PK
        int facultyId FK
        int semesterId FK
        timestamp preRegistrationStartDate
        timestamp preRegistrationEndDate
        timestamp registrationStartDate
        timestamp registrationEndDate
        enum status
    }

    %% Junction Tables
    lecturer_courses {
        int id PK
        int lecturerId FK
        int courseId FK
        boolean isActive
    }

    course_faculties {
        int id PK
        int courseId FK
        int facultyId FK
        text description
        boolean isActive
    }

    %% Settings
    settings {
        int id PK
        string key UK
        json value
        string description
    }

    %% Relationships - User Management
    users ||--o{ students : "has"
    users ||--o{ lecturers : "has"
    users ||--o{ notifications : "creates"
    users ||--o{ notification_recipients : "receives"
    users ||--o{ payment_transactions : "processes"

    %% Relationships - Academic Structure
    faculties ||--o{ departments : "contains"
    departments ||--o{ majors : "contains"
    departments ||--o{ lecturers : "employs"
    majors ||--o{ classes : "has"
    majors ||--o{ students : "enrolls"
    majors ||--o{ curriculums : "follows"

    %% Relationships - Academic Entities
    classes ||--o{ students : "contains"
    classes ||--o{ lecturers : "managed_by"
    lecturers ||--o{ class_groups : "teaches"
    lecturers ||--o{ class_weekly_schedules : "conducts"

    %% Relationships - Course Management
    courses ||--o{ class_groups : "offered_as"
    courses ||--o{ curriculum_courses : "included_in"
    courses ||--o{ study_plans : "planned_for"
    courses ||--o{ lecturer_courses : "taught_by"
    courses ||--o{ course_faculties : "related_to"
    semesters ||--o{ class_groups : "scheduled_in"
    semesters ||--o{ tuitions : "billed_for"
    semesters ||--o{ notifications : "announced_in"
    semesters ||--o{ exam_schedules : "conducted_in"
    semesters ||--o{ curriculum_courses : "suggested_in"
    semesters ||--o{ faculty_registration_schedules : "scheduled_for"

    %% Relationships - Enrollment and Grades
    students ||--o{ enrollment_courses : "enrolls_in"
    students ||--o{ grade_details : "receives"
    students ||--o{ tuitions : "pays"
    students ||--o{ study_plans : "plans"
    class_groups ||--o{ enrollment_courses : "enrolled_by"
    class_groups ||--o{ grade_details : "graded_in"
    class_groups ||--o{ class_weekly_schedules : "scheduled_for"
    class_groups ||--o{ class_adjustment_schedules : "adjusted_for"
    class_groups ||--o{ exam_schedules : "examined_in"
    enrollment_courses ||--o{ grade_details : "graded_as"
    enrollment_courses ||--o{ tuition_details : "billed_for"

    %% Relationships - Curriculum
    curriculums ||--o{ curriculum_courses : "includes"
    curriculum_courses ||--o{ courses : "prerequisite_for"

    %% Relationships - Scheduling
    time_slots ||--o{ class_weekly_schedules : "used_in"
    time_slots ||--o{ class_adjustment_schedules : "adjusted_to"
    rooms ||--o{ class_weekly_schedules : "hosts"
    rooms ||--o{ class_adjustment_schedules : "adjusted_to"
    rooms ||--o{ exam_schedules : "examines_in"

    %% Relationships - Tuition and Payments
    tuitions ||--o{ tuition_details : "details"
    tuitions ||--o{ payment_transactions : "paid_via"

    %% Relationships - Notifications
    notifications ||--o{ notification_audience_rules : "targets"
    notifications ||--o{ notification_recipients : "sent_to"

    %% Relationships - Faculty Registration
    faculties ||--o{ faculty_registration_schedules : "schedules"

    %% Relationships - Junction Tables
    lecturers ||--o{ lecturer_courses : "assigned_to"
    courses ||--o{ lecturer_courses : "taught_by"
    courses ||--o{ course_faculties : "related_to"
    faculties ||--o{ course_faculties : "offers"
```

## Database Schema Overview

This ERD represents a comprehensive University Education Management System (EMS) with the following main modules:

### 1. **User Management**

- `users`: Central user accounts with role-based access
- `students`: Student-specific information and academic records
- `lecturers`: Faculty member information and qualifications

### 2. **Academic Structure**

- `faculties`: University faculties/departments
- `departments`: Sub-departments within faculties
- `majors`: Academic programs/fields of study
- `classes`: Student cohorts by admission year and major

### 3. **Course Management**

- `courses`: Academic courses/subjects
- `semesters`: Academic terms
- `class_groups`: Course sections with capacity limits
- `curriculums`: Program requirements and course sequences

### 4. **Academic Operations**

- `enrollment_courses`: Student course registrations
- `grade_details`: Academic performance records
- `study_plans`: Student academic planning
- `curriculum_courses`: Course requirements within programs

### 5. **Scheduling System**

- `time_slots`: Available time periods
- `rooms`: Physical classroom locations
- `class_weekly_schedules`: Regular class schedules
- `class_adjustment_schedules`: Schedule modifications
- `exam_schedules`: Examination timetables

### 6. **Financial Management**

- `tuitions`: Student fee structures
- `tuition_details`: Individual course fees
- `payment_transactions`: Payment processing records

### 7. **Communication System**

- `notifications`: System announcements
- `notification_audience_rules`: Targeting rules
- `notification_recipients`: Delivery tracking

### 8. **Administrative Features**

- `faculty_registration_schedules`: Course registration periods
- `settings`: System configuration
- Junction tables for many-to-many relationships

### Key Features:

- **Role-based access control** through user roles
- **Academic hierarchy** from faculty → department → major → class
- **Flexible scheduling** with regular and adjustment schedules
- **Comprehensive grading** system with multiple grade types
- **Financial tracking** with detailed payment processing
- **Notification system** with audience targeting
- **Curriculum management** with prerequisites and requirements
- **Registration management** with faculty-specific schedules

The schema supports a complete university management workflow from student admission through graduation, including course registration, scheduling, grading, and financial management.
