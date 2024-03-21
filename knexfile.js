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
      host: process.env.AZURE_POSTGRESQL_HOST,
      user: process.env.AZURE_POSTGRESQL_USER,
      password: process.env.AZURE_POSTGRESQL_PASSWORD,
      database: process.env.AZURE_POSTGRESQL_DATABASE,
      port: Number(process.env.AZURE_POSTGRESQL_PORT),
      ssl: process.env.AZURE_POSTGRESQL_SSL
    }
  }
}
