// migrations/20210930_create_character.js
exports.up = function (knex) {
  return knex.schema
    .createTable('characters', function (table) {
      table.increments('id').primary()
      table.string('name', 255).notNullable().unique()
      table.integer('user_id').unsigned().notNullable()
      table.foreign('user_id').references('users.id')
      table.timestamps(true, true)
    })
    .createTable('leagues', function (table) {
      table.increments('id').primary()
      table.string('name', 255).notNullable().unique()
      table.float('score_multiplier').notNullable()
      table.timestamps(true, true)
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('characters')
    .dropTable('leagues')
}
