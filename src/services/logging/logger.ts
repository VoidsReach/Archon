import { createWriteStream, existsSync, mkdirSync, WriteStream } from "fs";
import path from "path";

const colors = {
    RESET: "\u001B[0m",
    INFO: "\u001B[38;2;135;206;250m",
    WARN: "\u001B[38;2;255;165;0m",
    ERROR: "\u001B[38;2;255;69;0m",
    DEBUG: "\u001B[38;2;0;191;255m",
    SUCCESS: "\u001B[38;2;50;205;50m",
    TRACE: "\u001B[38;2;255;165;0m",
    NONE: ""
};

/**
 * Represents the various levels of logging supported by the logger.
 * 
 * - `INFO`: Informational messages.
 * - `WARN`: Warnings that indicate potential issues.
 * - `ERROR`: Error messages indicating something went wrong.
 * - `DEBUG`: Debugging messages with detailed information.
 * - `SUCCESS`: Messages indicating successful operations.
 * - `NONE`: No logging; used to disable logging.
 */
export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "TRACE" | "SUCCESS" | "NONE";

/**
 * Defines the priority of each log level.
 * Lower numbers indicate higher priority.
 * 
 * - `NONE`: 0 (disabled logging)
 * - `SUCCESS`: 1
 * - `ERROR`: 2
 * - `WARN`: 3
 * - `INFO`: 4
 * - `DEBUG`: 5 (lowest priority, most verbose)
 */
const LogLevelPriority: Record<LogLevel, number> = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    SUCCESS: 3,
    DEBUG: 4,
    TRACE: 5
};

/**
 * Configuration options for the logger.
 * 
 * - `saveToFile` (optional): If `true`, logs will be written to a file.
 * - `logFilePath` (optional): The directory path where log files will be saved.
 *   If not provided, a default path of `../logs` will be used.
 * - `joiner` (optional): The string used to join multiple log messages.
 */
export interface LoggerConfig {
    saveToFile?: boolean;
    logFilePath?: string;
    joiner?: string;
}

interface ProgressContext {
    message: string;
    logs: string[];
    state: "pending" | "success" | "error";
    progress?: number;
}

/**
 * Logger class to handle logging messages to console, Discord, and files.
 */
export class Logger {
    protected currentLogLevel: LogLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel || "NONE";
    protected config: LoggerConfig;
    private logStream: WriteStream | null = null;

    constructor(config: LoggerConfig) {
        this.config = config;

        if (this.config.saveToFile) {
            this.setupFileLogging();
        }
    }

    /**
     * Initializes the file logging system by creating a log file in the specified path.
     * Ensures the directory exists before attempting to write to it.
     */
    private setupFileLogging(): void {
        const logPath = this.config.logFilePath || path.join(__dirname, "../logs");
        if (!existsSync(logPath)) {
            mkdirSync(logPath, { recursive: true });
        }

        const logFile = path.join(
            logPath, 
            `bot-log-${new Date().toISOString().split("T")[0]}.log`
        );
        this.logStream = createWriteStream(logFile, { flags: "a" });
    }

    /**
     * Determines if the log level should be logged based on the current log level priority.
     * @param level The log level to check.
     * @returns `true` if the message should be logged, otherwise `false`.
     */
    protected shouldLog(level: LogLevel): boolean {
        return LogLevelPriority[level] <= LogLevelPriority[this.currentLogLevel];
    }

    /**
     * Formats a message array into a single string using the configured joiner.
     * @param messages The messages to format.
     * @returns The formatted message string.
     */
    protected formatMessage(...messages: unknown[]): string {
        const formatted = messages
            .flat()
            .map(msg => (typeof msg === "string" ? msg : JSON.stringify(msg)))
            .join(this.config.joiner || " ");
        return formatted; 
    }

    /**
     * Formats a colored log message for console output.
     * @param level The log level.
     * @param messages The messages to format.
     * @returns The formatted colored message string.
     */
    protected formatColoredMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        const color = colors[level] || colors.INFO
        return `${colors.RESET}${timestamp} [${color}${level}${colors.RESET}] ${message}`
    }

    /**
     * Writes a log message to the configured log file.
     * @param level The log level.
     * @param messages The messages to write.
     */
    private logToFile(level: LogLevel, ...messages: unknown[]): void {
        if (!this.logStream || !this.shouldLog(level)) return;

        const timestamp = new Date().toISOString();
        this.logStream.write(`${timestamp} [${level}] ${this.formatMessage(...messages)}\n`);
    }

    /**
     * Logs a message to console, Discord, and/or a file based on the provided configuration.
     * @param level The log level.
     * @param discord Whether to log to Discord.
     * @param file Whether to log to a file.
     * @param messages The messages to log.
     */
    public async log(
        level: LogLevel,  
        file?: boolean,
        ...messages: unknown[]
    ): Promise<string | null> {
        if (!this.shouldLog(level)) return null;
        const combinedMessage = this.formatMessage(...messages);
        const formattedMessage = this.formatColoredMessage(level, combinedMessage);

        switch (level) {
            case "NONE":
                break;
            case "WARN":
                console.warn(formattedMessage);
                break;
            case "ERROR":
                console.error(formattedMessage);
                break;
            case "TRACE":
                return formattedMessage;
            default:
                console.log(formattedMessage);
                break;
        }
        
        if (file) this.logToFile(level, messages);

        return combinedMessage;
    }

    /**
     * Processes logging arguments to extract options and message content.
     * @param args The logging arguments.
     * @returns An object containing logging options and the extracted messages.
     */
    private handleLogArgs(
        args: unknown[]
    ): { options: {file?: boolean}; messages: unknown[] } {
        let options: { file?: boolean } = { file: false };
        let messages: unknown[]; 

        if (typeof args[0] === "object" && !Array.isArray(args[0] && args[0] !== null)) {
            options = args[0] as { file?: boolean };
            messages = args.slice(1);
        } else {
            messages = args;
        }

        return { options, messages };
    }


    /**
     * Logs an informational message.
     * @param args The message arguments.
     */
    public info(...args: unknown[]): void {
        const { options, messages } = this.handleLogArgs(args);
        this.log("INFO", options.file, ...messages);
    }

    /**
     * Logs a warning message.
     * @param args The message arguments.
     */
    public warn(...args: unknown[]): void {
        const { options, messages } = this.handleLogArgs(args);
        this.log("WARN", options.file, ...messages);
    }

    /**
     * Logs an error message.
     * @param args The message arguments.
     */
    public error(...args: unknown[]): void {
        const { options, messages } = this.handleLogArgs(args);
        this.log("ERROR", options.file, ...messages);
    }

    /**
     * Logs a debug message.
     * @param args The message arguments.
     */
    public debug(...args: unknown[]): void {
        const { options, messages } = this.handleLogArgs(args);
        this.log("DEBUG", options.file, ...messages);
    }

    /**
     * Logs a success message.
     * @param args The message arguments.
     */
    public success(...args: unknown[]): void {
        const { options, messages } = this.handleLogArgs(args);
        this.log("SUCCESS", options.file, ...messages);
    }

    /**
     * Logs a success message.
     * @param args The message arguments.
     */
    public async trace(...args: unknown[]): Promise<void> {
        const { options, messages } = this.handleLogArgs(args);
        const msg = await this.log("TRACE", options.file, ...messages);
        console.trace(msg);
    }

}

/**
 * Tests all log levels for the given logger.
 * @param logger The logger instance to test.
 */
export function testLogLevels(logger: Logger): void {
    logger.info("Testing Info!");
    logger.debug("Testing Debug!");
    logger.warn("Testing Warn!");
    logger.error("Testing Error!");
    logger.success("Testing Success!");
}