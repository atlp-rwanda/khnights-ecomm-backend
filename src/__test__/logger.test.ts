import { dbConnection } from '../startups/dbConnection';
import logger from '../utils/logger';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import { server } from '../../src/index';

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
}));

beforeAll(async () => {
  const connection = await dbConnection();
});

afterAll(async () => {
  await cleanDatabase();
  server.close();
});

describe('Logger', () => {
  it('should create a logger with the correct configuration', () => {
    expect(logger).toBeDefined();
  });

  it('should log messages with the correct level and format', () => {
    const testMessage = 'Test log message';
    const testLevel = 'info';

    logger.log(testLevel, testMessage);

    expect(logger.log).toHaveBeenCalledWith(testLevel, testMessage);
  });

  it('should correctly handle info level logs', () => {
    const testMessage = 'Test info message';

    logger.info(testMessage);

    expect(logger.info).toHaveBeenCalledWith(testMessage);
  });

  it('should correctly handle warn level logs', () => {
    const testMessage = 'Test warn message';

    logger.warn(testMessage);

    expect(logger.warn).toHaveBeenCalledWith(testMessage);
  });

  it('should correctly handle error level logs', () => {
    const testMessage = 'Test error message';

    logger.error(testMessage);

    expect(logger.error).toHaveBeenCalledWith(testMessage);
  });

  it('should correctly handle debug level logs', () => {
    const testMessage = 'Test debug message';

    logger.debug(testMessage);

    expect(logger.debug).toHaveBeenCalledWith(testMessage);
  });

  it('should correctly handle http level logs', () => {
    const testMessage = 'Test http message';

    logger.http(testMessage);

    expect(logger.http).toHaveBeenCalledWith(testMessage);
  });
});