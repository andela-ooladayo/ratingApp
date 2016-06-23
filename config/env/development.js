'use strict';

module.exports = {
	db: {
       dbName:'rating-app',
       username : '',
       password : '',
       dialect: "postgres",
       port : 5432 //
    },
	app: {
		title: 'SEAN - Development Environment'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '233301570389186',
		clientSecret: process.env.FACEBOOK_SECRET || '69ae96bbdb9989177f9169d67b65c036',
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || '774xcxefqf2w44',
		clientSecret: process.env.LINKEDIN_SECRET || 'f0wBl5PDlGFG9W2v',
		callbackURL: 'http://localhost:3000/auth/linkedin/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
