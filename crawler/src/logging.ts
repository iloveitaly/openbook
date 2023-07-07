import type { LogLevelNames } from "loglevel"
import logger from "loglevel"
import logLevelPrefix from "loglevel-plugin-prefix"

function configureLogging() {
  // TODO extract out to separate logging config
  // add expected log level prefixes
  logLevelPrefix.reg(logger)
  logger.enableAll()
  logLevelPrefix.apply(logger)

  if (process.env.LOG_LEVEL) {
    const logLevelFromEnv = process.env.LOG_LEVEL.toLowerCase() as LogLevelNames
    logger.setLevel(logLevelFromEnv)
  } else {
    logger.setLevel(logger.levels.INFO)
  }

  return logger
}

configureLogging()

export const log = logger
export default { log: logger }