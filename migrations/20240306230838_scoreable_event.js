// migrations/20210930_create_scoring_event.js
exports.up = function(knex) {
    return knex.schema.createTable('scoring_events', function(table) {
      table.increments('id').primary();
      table.integer('team_id').unsigned();
      table.foreign('team_id').references('teams.id');
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');
      table.integer('scoreable_object_id').unsigned().notNullable();
      table.foreign('scoreable_object_id').references('scoreable_objects.id');
      table.integer('character_id').unsigned();
      table.foreign('character_id').references('characters.id');
      table.integer('league_id').unsigned().notNullable();
      table.foreign('league_id').references('leagues.id');
      table.timestamp('timestamp').defaultTo(knex.fn.now());
      table.boolean('is_approved').defaultTo(false);
      table.string('evidence_url');
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('scoring_events');
  };