export class LambdaSqsConsumerService {
  constructor() {}

  async processRecords(records: any[]) {
    for (const record of records) {
      try {
        const body = JSON.parse(record.body);
        await this.processMessage(body, record.messageId || record.MessageId);
      } catch (err) {
        console.error('Error parsing record body', err);
        // If we throw here, Lambda/SQS will re-try according to configuration
        throw err;
      }
    }
  }

  async processMessage(body: any, messageId?: string) {
    console.log('[LAMBDA_PROCESS_MESSAGE] start', { messageId, body });

    // Example processing logic depending on event type
    if (body.event === 'NOTE_CREATED') {
      // TODO: implement indexing / async processing
      console.log('[LAMBDA] NOTE_CREATED processing for noteId=', body.noteId);
      // In a real setup you could call an internal API or initialize a lightweight DB client
    } else if (body.event === 'FILE_ATTACHED') {
      console.log('[LAMBDA] FILE_ATTACHED processing for noteId=', body.noteId, 'fileUrl=', body.fileUrl);
      // TODO: validate S3 object, generate thumbnails, update metadata in DB
    } else {
      console.log('[LAMBDA] Unknown event type', body.event);
    }

    console.log('[LAMBDA_PROCESS_MESSAGE] done', { messageId });
  }
}
