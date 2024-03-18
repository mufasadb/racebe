// migrations/20210930_create_scoreable_object.js
exports.up = function(knex) {
    return knex.schema.createTable('scoreable_objects', function(table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable().unique();
      table.text('description');
      table.boolean('requires_evidence').defaultTo(false);
      table.boolean('league_multiplier').defaultTo(false);
      table.integer('points').notNullable();
      table.enu('submittable_type', ['character', 'player', 'player_bounty', 'team_bounty','server_bounty']).defaultTo('player');
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('scoreable_objects');
  };