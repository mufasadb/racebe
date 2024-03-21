// knexfile.js
require('dotenv').config()

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.AZURE_POSTGRESQL_9DBA8_HOST,
      user: process.env.AZURE_POSTGRESQL_9DBA8_USER,
      password: process.env.AZURE_POSTGRESQL_9DBA8_PASSWORD,
      database: process.env.AZURE_POSTGRESQL_9DBA8_DATABASE,
      port: Number(process.env.AZURE_POSTGRESQL_9DBA8_PORT),
      ssl: process.env.AZURE_POSTGRESQL_9DBA8_SSL
    }
  }
}
