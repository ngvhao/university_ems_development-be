import { SQSEvent, SQSHandler } from 'aws-lambda';
import dataSource from 'db/data-source';
import { createStudent } from 'src/common/function/createStudent.function';

export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);

      if (message.type === 'student') {
        await createStudent(message.data, dataSource);
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
