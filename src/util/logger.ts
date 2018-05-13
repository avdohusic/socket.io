const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

export const logger = createLogger({
    format: combine(
        format.splat(),
        format.simple(),
        format.json(),
        timestamp()
    ),
    transports: [new transports.Console()],
});
