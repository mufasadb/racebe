const { Model } = require('objection')

class Team extends Model {
  static get tableName () {
    return 'teams'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        colour: { type: 'string', minLength: 1, maxLength: 255 }
      }
    }
  }
}

module.exports = Team
