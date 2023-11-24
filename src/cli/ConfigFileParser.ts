import ConfigParser from 'configparser';
import { CLIOptionParserEntry, CLIOptions } from './CLIOptions.js';
import { DeepPartial, RecursivePropsTo } from '../utils/Misc.js';

const CONFIG_FILE_PROPS = {
  targetURL: 'downloader:target.url',
  cookie: 'downloader:cookie',
  useStatusCache: 'downloader:use.status.cache',
  noPrompt: 'downloader:no.prompt',
  pathToFFmpeg: 'downloader:path.to.ffmpeg',
  outDir: 'output:out.dir',
  dirNameFormat: {
    campaign: 'output:campaign.dir.name.format',
    content: 'output:content.dir.name.format'
  },
  filenameFormat: {
    media: 'output:media.filename.format'
  },
  fileExistsAction: {
    content: 'output:content.file.exists.action',
    info: 'output:info.file.exists.action',
    infoAPI: 'output:info.api.file.exists.action'
  },
  include: {
    lockedContent: 'include:locked.content',
    campaignInfo: 'include:campaign.info',
    contentInfo: 'include:content.info',
    previewMedia: 'include:preview.media',
    contentMedia: 'include:content.media',
    allMediaVariants: 'include:all.media.variants'
  },
  request: {
    maxRetries: 'request:max.retries',
    maxConcurrent: 'request:max.concurrent',
    minTime: 'request:min.time'
  },
  consoleLogger: {
    enabled: 'logger.console:enabled',
    logLevel: 'logger.console:log.level',
    include: {
      dateTime: 'logger.console:include.date.time',
      level: 'logger.console:include.level',
      originator: 'logger.console:include.originator',
      errorStack: 'logger.console:include.error.stack'
    },
    dateTimeFormat: 'logger.console:date.time.format',
    color: 'logger.console:color'
  },
  fileLogger: {
    enabled: ':enabled',
    logDir: ':log.dir',
    logFilename: ':log.filename',
    fileExistsAction: ':file.exists.action',
    logLevel: ':log.level',
    include: {
      dateTime: ':include.date.time',
      level: ':include.level',
      originator: ':include.originator',
      errorStack: ':include.error.stack'
    },
    dateTimeFormat: ':date.time.format',
    color: ':color'
  }
};

type ConfigFileParseResult = RecursivePropsTo<DeepPartial<CLIOptions>, CLIOptionParserEntry>;

export default class ConfigFileParser {

  static parse(file: string): ConfigFileParseResult {
    const parser = new ConfigParser();

    parser.read(file);

    const __getValue = (prop: string): CLIOptionParserEntry | undefined => {
      return this.#getValueFromConfigParser(parser, prop);
    };

    return {
      targetURL: __getValue(CONFIG_FILE_PROPS.targetURL),
      cookie: __getValue(CONFIG_FILE_PROPS.cookie),
      useStatusCache: __getValue(CONFIG_FILE_PROPS.useStatusCache),
      pathToFFmpeg: __getValue(CONFIG_FILE_PROPS.pathToFFmpeg),
      outDir: __getValue(CONFIG_FILE_PROPS.outDir),
      dirNameFormat: {
        campaign: __getValue(CONFIG_FILE_PROPS.dirNameFormat.campaign),
        content: __getValue(CONFIG_FILE_PROPS.dirNameFormat.content)
      },
      filenameFormat: {
        media: __getValue(CONFIG_FILE_PROPS.filenameFormat.media)
      },
      include: {
        lockedContent: __getValue(CONFIG_FILE_PROPS.include.lockedContent),
        campaignInfo: __getValue(CONFIG_FILE_PROPS.include.campaignInfo),
        contentInfo: __getValue(CONFIG_FILE_PROPS.include.contentInfo),
        previewMedia: __getValue(CONFIG_FILE_PROPS.include.previewMedia),
        contentMedia: __getValue(CONFIG_FILE_PROPS.include.contentMedia),
        allMediaVariants: __getValue(CONFIG_FILE_PROPS.include.allMediaVariants)
      },
      request: {
        maxRetries: __getValue(CONFIG_FILE_PROPS.request.maxRetries),
        maxConcurrent: __getValue(CONFIG_FILE_PROPS.request.maxConcurrent),
        minTime: __getValue(CONFIG_FILE_PROPS.request.minTime)
      },
      fileExistsAction: {
        content: __getValue(CONFIG_FILE_PROPS.fileExistsAction.content),
        info: __getValue(CONFIG_FILE_PROPS.fileExistsAction.info),
        infoAPI: __getValue(CONFIG_FILE_PROPS.fileExistsAction.infoAPI)
      },
      noPrompt: __getValue(CONFIG_FILE_PROPS.noPrompt),
      consoleLogger: {
        enabled: __getValue(CONFIG_FILE_PROPS.consoleLogger.enabled),
        logLevel: __getValue(CONFIG_FILE_PROPS.consoleLogger.logLevel),
        include: {
          dateTime: __getValue(CONFIG_FILE_PROPS.consoleLogger.include.dateTime),
          level: __getValue(CONFIG_FILE_PROPS.consoleLogger.include.level),
          originator: __getValue(CONFIG_FILE_PROPS.consoleLogger.include.originator),
          errorStack: __getValue(CONFIG_FILE_PROPS.consoleLogger.include.errorStack)
        },
        dateTimeFormat: __getValue(CONFIG_FILE_PROPS.consoleLogger.dateTimeFormat),
        color: __getValue(CONFIG_FILE_PROPS.consoleLogger.color)
      },
      fileLoggers: this.#parseFileLoggerOptions(parser)
    };
  }

  static #getValueFromConfigParser(parser: ConfigParser, prop: string): CLIOptionParserEntry | undefined {
    const [ section, key ] = prop.split(':');
    let value = parser.get(section, key)?.trim();
    if (value && value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    if (value) {
      return {
        src: 'cfg',
        section,
        key,
        value
      };
    }
    return undefined;
  }

  static #parseFileLoggerOptions(parser: ConfigParser) {
    const __getValue = (section: string, prop: string): CLIOptionParserEntry | undefined => {
      return this.#getValueFromConfigParser(parser, `${section}${prop}`);
    };

    const sections = parser.sections().filter((section) => section.startsWith('logger.file.'));

    const loggers = sections.reduce<NonNullable<ConfigFileParseResult['fileLoggers']>>((result, section) => {
      result.push({
        enabled: __getValue(section, CONFIG_FILE_PROPS.fileLogger.enabled),
        logDir: __getValue(section, CONFIG_FILE_PROPS.fileLogger.logDir),
        logFilename: __getValue(section, CONFIG_FILE_PROPS.fileLogger.logFilename),
        fileExistsAction: __getValue(section, CONFIG_FILE_PROPS.fileLogger.fileExistsAction),
        logLevel: __getValue(section, CONFIG_FILE_PROPS.fileLogger.logLevel),
        include: {
          dateTime: __getValue(section, CONFIG_FILE_PROPS.fileLogger.include.dateTime),
          level: __getValue(section, CONFIG_FILE_PROPS.fileLogger.include.level),
          originator: __getValue(section, CONFIG_FILE_PROPS.fileLogger.include.originator),
          errorStack: __getValue(section, CONFIG_FILE_PROPS.fileLogger.include.errorStack)
        },
        dateTimeFormat: __getValue(section, CONFIG_FILE_PROPS.fileLogger.dateTimeFormat),
        color: __getValue(section, CONFIG_FILE_PROPS.fileLogger.color)
      });
      return result;
    }, []);

    return loggers.length > 0 ? loggers : undefined;
  }
}
