import { getCurrentInvoke } from '@codegenie/serverless-express';

const getRequestId = () => {
  const { context } = getCurrentInvoke();

  return context?.awsRequestId ?? 'local';
};

export { getRequestId };
