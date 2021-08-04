import { logger } from './logger';

export const missingEnvAttrError = (attributeName: string, topic: string) => {
  const { error } = logger(topic);
  const errorMessage = `missing "${attributeName}" on env object.`;

  error(errorMessage);
  throw new Error(errorMessage);
};
