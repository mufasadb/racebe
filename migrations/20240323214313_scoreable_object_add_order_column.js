/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('scoreable_objects', function (table) {
    table.string('sort_order').defaultTo('50')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('scoreable_objects', function (table) {
    table.dropColumn('sort_order')
  })
}
