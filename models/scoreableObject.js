const { Model } = require('objection')

class ScoreableObject extends Model {
  static get tableName () {
    return 'scoreableObjects'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'name',
        'requires_evidence',
        'league_multiplier',
        'points',
        'submittable_type'
      ],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string', minLength: 1 },
        user_id: { type: 'integer' },
        requires_evidence: { type: 'boolean' },
        league_multiplier: { type: 'boolean' },
        points: { type: 'integer' },
        submittable_type: {
          type: 'string',
          enum: [
            'character',
            'player',
            'player_bounty',
            'team_bounty',
            'server_bounty'
          ]
        }
      }
    }
  }
}

module.exports = ScoreableObject
