const { Model } = require('objection')

class League extends Model {
  static get tableName () {
    return 'leagues'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['name', 'score_multiplier'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        score_multiplier: { type: 'number' }
      }
    }
  }
}

module.exports = League
