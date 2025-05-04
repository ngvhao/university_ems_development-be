// import { SQSEvent, SQSHandler } from 'aws-lambda';
// import { StudentService } from 'src/modules/student/student.service';

// export const handler: SQSHandler = async (event: SQSEvent) => {
//   for (const record of event.Records) {
//     try {
//       const message = JSON.parse(record.body);

//       if (message.type === 'student') {
//         await new StudentService().createStudent(message);
//         console.log(`Processed student: ${JSON.stringify(message.data)}`);
//       } else {
//         console.warn(`Unknown message type: ${message.type}`);
//       }
//     } catch (err) {
//       console.error(`Error processing message: ${err}`);
//       throw err;
//     }
//   }
// };
