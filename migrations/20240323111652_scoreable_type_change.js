/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.table('scoreable_objects', function (table) {
    table.renameColumn('submittable_type', 'old_submittable_type')
  })

  // Step 2: Add the new column with the new enum
  await knex.schema.table('scoreable_objects', function (table) {
    table
      .enu('submittable_type', [
        'character_objective',
        'account_objective',
        'team_objective',
        'team_bounty',
        'account_bounty'
      ])
      .defaultTo('account_bounty')
  })

  // Step 3: Update records with new enum values based on the old enum values
  await knex('scoreable_objects').update({
    submittable_type: knex.raw(`CASE
          WHEN old_submittable_type = 'character' THEN 'character_objective'
          WHEN old_submittable_type = 'player' THEN 'account_objective'
          WHEN old_submittable_type = 'player_bounty' THEN 'account_bounty'
          WHEN old_submittable_type = 'team_bounty' THEN 'team_objective'
          WHEN old_submittable_type = 'server_bounty' THEN 'team_bounty'
          ELSE 'account_bounty' END`)
  })

  // Step 4: Drop the old enum column
  await knex.schema.table('scoreable_objects', function (table) {
    table.dropColumn('old_submittable_type')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Step 1: Add the old submittable_type column with original enum values
  await knex.schema.table('scoreable_objects', function (table) {
    table
      .enu('old_submittable_type', [
        'character',
        'player',
        'player_bounty',
        'team_bounty',
        'server_bounty'
      ])
      .defaultTo('player')
  })

  // Step 2: Map the values from the new types back to the old types
  await knex('scoreable_objects').update({
    old_submittable_type: knex.raw(`CASE
        WHEN submittable_type = 'character_objective' THEN 'character'
        WHEN submittable_type = 'account_objective' THEN 'player'
        WHEN submittable_type = 'team_objective' THEN 'team_bounty'
        WHEN submittable_type = 'team_bounty' THEN 'server_bounty'
        WHEN submittable_type = 'account_bounty' THEN 'player_bounty'
        ELSE 'player' END`)
  })

  // Step 3: Drop the new submittable_type column
  await knex.schema.table('scoreable_objects', function (table) {
    table.dropColumn('submittable_type')
  })

  // Step 4: Rename the old_submittable_type back to submittable_type
  await knex.schema.table('scoreable_objects', function (table) {
    table.renameColumn('old_submittable_type', 'submittable_type')
  })
}
