// migrations/20210628133000_create_teams_and_users.js

exports.up = function(knex) {
    return knex.schema
      .createTable('teams', function (table) {
         table.increments('id');
         table.string('name').unique();
         table.timestamps();
       })
      .createTable('users', function (table) {
         table.increments('id');
         table.string('username').unique();
         table.enu('role', ['player', 'team_leader', 'admin']).defaultTo('player');
         table.integer('team_id').unsigned().references('teams.id');
         table.timestamps();
       });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTable('users')
      .dropTable('teams');
  };