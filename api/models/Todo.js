const moment = require('moment');

module.exports = {
  schema: true,
  attributes: {
    name: {
      type: 'string'
    },

    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      defaultsTo: 'medium'
    },

    date: {
      type: 'string'
    }
  },

  beforeCreate: (todo, next) => {
    if (!todo.date) {
      todo.date = moment(todo.date).add(7, 'days').format("YYYY-DD-MM");
    }
    next();
  }
}
