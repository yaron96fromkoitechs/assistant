export const TYPES = {
  IUserRepository: Symbol.for('IUserRepository'),
  IUserService: Symbol.for('IUserService'),
  IMealRepository: Symbol.for('IMealRepository'),
  IMealService: Symbol.for('IMealService'),

  ILoggerService: Symbol.for('ILoggerService'),
  IConfigService: Symbol.for('IConfigService'),
  IFileService: Symbol.for('IFileService'),
  IGptService: Symbol.for('IGptService'),
  IAssistantService: Symbol.for('IAssistantService'),
  PrismaService: Symbol.for('IPrismaService'),
  TelegramService: Symbol.for('TelegramService'),

  QueueService: Symbol.for('QueueService'),

  TelegramBot: Symbol.for('TelegramBot'),
  ChatSceneHandler: Symbol.for('ChatSceneHandler'),
  UserSettingsSceneHandler: Symbol.for('UserSettingsSceneHandler'),
  MealSceneHandler: Symbol.for('MealSceneHandler'),

  WebServer: Symbol.for('WebServer'),
  IChatController: Symbol.for('IChatController'),

  Application: Symbol.for('Application')
};
