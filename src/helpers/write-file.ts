import { writeFileSync } from 'fs';

export const writeFile = (filePath: string, content: object) =>
  writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`);
