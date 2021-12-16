import type { Env, Message } from '../../types';

const messageFactory: (id: number) => Message = (id: number) => ({
  hash: `mockHash ${id}`,
  date: `mockDate ${id}`,
  message: `mockMessage ${id}`,
  body: `mockBody ${id}`,
  text: `text ${id}`,
  level: 'patch',
});

// mock Logger
const mockLoggerError = jest.fn();
const mockLogger = jest.fn(() => ({
  error: mockLoggerError,
}));
jest.mock('../../helpers/logger', () => ({
  logger: mockLogger,
}));

// mock SingleGit
const mockRaw = jest.fn();
const mockSimpleGit = jest.fn(() => ({
  raw: mockRaw,
}));
jest.mock('simple-git', () => mockSimpleGit);

const { envWithConfig } = require('../../fixtures/env');
const { addFilesToCommitMessages } = require('../add-files-to-commit-messages');

describe('addFilesToCommitMessages Module', () => {
  it('throws an exeption when no originalCommitMessages are present', async () => {
    await expect(addFilesToCommitMessages(envWithConfig)).rejects.toThrow(
      'Cannot read commitMessages to extract committed files'
    );
  });

  it('throws an exeption when files cannot be extracted', async () => {
    const mockEnv: Env = {
      ...envWithConfig,
      commitMessages: [
        {
          hash: '7ec3f9525cf2c2cd9c63836b7a71fb0092c02657',
        },
      ],
    };

    const mockError = 'Mock simpleGit().raw exception';
    mockRaw.mockRejectedValue(mockError);
    await expect(addFilesToCommitMessages(mockEnv)).rejects.toThrow(
      'Cannot extract committed files'
    );
    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(mockLoggerError).toHaveBeenCalledWith(mockError);
  });

  describe('with a commitMessages collection', () => {
    let result: Env;
    const mockCommitMessage = [messageFactory(1)];
    const mockCommittedFiles: string[] = [
      '/mock_path_to_file_1',
      '/mock_path_to_file_2',
    ];
    const mockEnv: Env = {
      ...envWithConfig,
      commitMessages: mockCommitMessage,
    };

    beforeAll(async () => {
      mockRaw.mockResolvedValue(mockCommittedFiles.join('\n'));
      result = await addFilesToCommitMessages(mockEnv);
    });

    it('returns an Env object with files on its commitMessages collection', () => {
      const expected: Env = {
        ...mockEnv,
        commitMessages: [
          {
            ...mockCommitMessage[0],
            committedFiles: mockCommittedFiles,
          },
        ],
      };
      expect(result).toEqual(expected);
    });
  });

  describe('with no committed files', () => {
    let result: Env;
    const mockCommitMessage = [messageFactory(1)];

    const mockEnv: Env = {
      ...envWithConfig,
      commitMessages: mockCommitMessage,
    };

    beforeAll(async () => {
      mockRaw.mockResolvedValue('');
      result = await addFilesToCommitMessages(mockEnv);
    });

    it('returns an Env object with files on its commitMessages collection', () => {
      const expected: Env = {
        ...mockEnv,
        commitMessages: [
          {
            ...mockCommitMessage[0],
            committedFiles: [],
          },
        ],
      };
      expect(result).toEqual(expected);
    });
  });
});
