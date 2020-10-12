const bodyParser = require('body-parser');
const config = require('config')
const cookieParser = require('cookie-parser');;
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const yaml = require('js-yaml');
const log4js = require('log4js');
const moment = require('moment');
const nocache = require('nocache')
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const node_env = config.node_env || 'development';

const errorHandler = require('./middlewares/error-handler')
const routes = require('./components');

const app = express();

app.use(cors());

/**
 * Setup logger
 */
try {
    let date = new moment().format('YYYY-MM-DD')
    
    log4js.configure({
        appenders: {
            out: { type: 'stdout' },
            fileLog: { type: 'dateFile', filename: 'logs/' + date + '.log', pattern: '.yyyy-MM-dd' },
        },
        categories: {
          default: { appenders: ['out', 'fileLog'], level: 'all' }
		}
    });
} catch (err) {
    console.log(err)
}

const logger = log4js.getLogger('server');
logger.level = config.logLevel;
logger.debug('Setting up app: registering routes, middleware...');

/**
 * Update Swagger Document
 */
const swaggerDocument = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../public', 'open-api.yaml'), 'utf8'));


/**
 * Block unsecure connection
 */
if (node_env === 'production') {

	app.use(function (req, res, next) {
		if (!req.secure) {
			res.status(401).send('Request is unauthorized');
		} else {
			next();
		}
	});
	app.enable('trust proxy');
}

/**
 * Support json parsing
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

/** 
 * Setup middleware for authentication
 */
app.use(helmet());
app.use(cookieParser());
app.use(nocache());
app.enable('trust proxy');

/**
 * GET home page
 */
app.get('/', (req, res) => {
	res.redirect('/api-docs');
});

var swaggerOptions = {
	defaultModelsExpandDepth: -1,
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, false, swaggerOptions));

/**
 * Register routes
 */
app.use('/api', routes);

/**
 * Error handler
 */
app.use(errorHandler.catchNotFound);
app.use(errorHandler.handleError);

/**
 * Start server
 */
const host = process.env.HOST || config.host;
const port = process.env.PORT || config.port;

app.listen(port, () => {
	logger.info(`App listening on http://${host}:${port}`);
    logger.info(`Swagger UI is available at http://${host}:${port}/api-docs`);
});