const { Model } = require('objection')

class Character extends Model {
  static get tableName () {
    return 'characters'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['name', 'user_id'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        user_id: { type: 'integer' }
      }
    }
  }
}

module.exports = Character
