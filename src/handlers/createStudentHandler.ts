import { SQSEvent, SQSHandler } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { StudentService } from 'src/modules/student/student.service';

let studentService: StudentService;

export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!studentService) {
    const app = await NestFactory.createApplicationContext(AppModule);
    studentService = app.get(StudentService);
  }

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);

      if (message.type === 'student') {
        await studentService.createStudent(message.data);
        console.log(`Processed student: ${JSON.stringify(message.data)}`);
      } else {
        console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (err) {
      console.error(`Error processing message: ${err}`);
      throw err;
    }
  }
};
