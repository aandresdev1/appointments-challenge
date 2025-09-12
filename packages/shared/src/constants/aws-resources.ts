// AWS Resource names and configurations

export const AWS_RESOURCES = {
  // DynamoDB
  DYNAMODB: {
    APPOINTMENTS_TABLE: 'rimac-appointments',
    GSI_INSURED_INDEX: 'GSI1-InsuredId-CreatedAt-Index',
  },

  // SNS
  SNS: {
    APPOINTMENT_TOPIC: 'rimac-appointment-topic',
    TOPIC_ARN: '${self:custom.snsTopicArn}',
  },

  // SQS
  SQS: {
    APPOINTMENT_PE_QUEUE: 'rimac-appointment-pe-queue',
    APPOINTMENT_CL_QUEUE: 'rimac-appointment-cl-queue',
    COMPLETION_QUEUE: 'rimac-appointment-completion-queue',

    // Dead Letter Queues
    APPOINTMENT_PE_DLQ: 'rimac-appointment-pe-dlq',
    APPOINTMENT_CL_DLQ: 'rimac-appointment-cl-dlq',
    COMPLETION_DLQ: 'rimac-appointment-completion-dlq',
  },

  // EventBridge
  EVENTBRIDGE: {
    APPOINTMENT_BUS: 'rimac-appointment-events',
    COMPLETION_RULE: 'appointment-completion-rule',
  },

  // Lambda Functions
  LAMBDA: {
    APPOINTMENT_API: 'rimac-appointment-api',
    APPOINTMENT_PE: 'rimac-appointment-pe',
    APPOINTMENT_CL: 'rimac-appointment-cl',
  },

  // API Gateway
  API: {
    BASE_PATH: 'api/v1',
    STAGE: '${self:custom.stage}',
  },
} as const;

// Environment variable names
export const ENV_VARS = {
  STAGE: 'STAGE',
  AWS_REGION: 'AWS_REGION',

  // DynamoDB
  APPOINTMENTS_TABLE_NAME: 'APPOINTMENTS_TABLE_NAME',

  // SNS
  SNS_TOPIC_ARN: 'SNS_TOPIC_ARN',

  // SQS
  SQS_PE_QUEUE_URL: 'SQS_PE_QUEUE_URL',
  SQS_CL_QUEUE_URL: 'SQS_CL_QUEUE_URL',
  SQS_COMPLETION_QUEUE_URL: 'SQS_COMPLETION_QUEUE_URL',

  // EventBridge
  EVENTBRIDGE_BUS_NAME: 'EVENTBRIDGE_BUS_NAME',

  // RDS
  RDS_PE_HOST: 'RDS_PE_HOST',
  RDS_PE_PORT: 'RDS_PE_PORT',
  RDS_PE_DATABASE: 'RDS_PE_DATABASE',
  RDS_PE_USERNAME: 'RDS_PE_USERNAME',
  RDS_PE_PASSWORD: 'RDS_PE_PASSWORD',

  RDS_CL_HOST: 'RDS_CL_HOST',
  RDS_CL_PORT: 'RDS_CL_PORT',
  RDS_CL_DATABASE: 'RDS_CL_DATABASE',
  RDS_CL_USERNAME: 'RDS_CL_USERNAME',
  RDS_CL_PASSWORD: 'RDS_CL_PASSWORD',
} as const;

// Message attributes for SNS filtering
export const SNS_MESSAGE_ATTRIBUTES = {
  COUNTRY_FILTER: {
    PE: { DataType: 'String', StringValue: 'PE' },
    CL: { DataType: 'String', StringValue: 'CL' },
  },
} as const;
