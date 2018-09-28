const { ApolloServer, gql } = require('apollo-server');

module.exports = {
  getModelAttributes: (model) => {
      return sails.models[model.toLowerCase()] && sails.models[model.toLowerCase()].definition;
  },

  getModels: () => {
    return new Promise( (resolve, reject) => {
      models = {}
      for (let model in sails.models) {
        models[model] = GraphQLService.getModelAttributes(model);
      }
      return resolve(models);
    });
  },

  makeSchema: () => {
    return new Promise( (resolve, reject) => {

      // Create GraphQL Schemas
      GraphQLService.getModels()
      .then((models) => {
        let query = ``;
        for (let model in models) {
          let _model = model.charAt(0).toUpperCase() + model.slice(1);
          query = `
          type ${_model} {
            id: String,
            `
          for (let field in models[model]) {
            if (field == "id" || field == "createdAt" || field == "updatedAt") continue;
            let type = models[model][field].type;
            query += `
                ${field}: ${type.charAt(0).toUpperCase() + type.slice(1)},
              `
          }
          query = query.slice(0, query.length - 1);
          query += `}
          `;
          query += `type Query {
            ${model}s(orderBy: String): [${_model}]
          }
          type Mutation {`
          query += GraphQLService.makeMutations(_model, models, model);
          query += `}`;

        }

        return resolve(query);
      })
    });
  },

  makeMutations: ( _model, models, model) => {
    return GraphQLService.makeFunction(['add', 'edit', 'delete'], _model, models, model);

  },

  makeFunction: (funcs, _model, models, model) => {
    let query = '';
    funcs.forEach(func => {
      query += `
          ${func}${_model}(`
      for (let field in models[model]) {
        if (field == "createdAt" || field == "updatedAt") continue;
        if (field == "id" && func == "add") continue

        let type = models[model][field].type.replace("integer", "String");
        query += `${field}: ${type.charAt(0).toUpperCase() + type.slice(1)},`;
      }
      query = query.slice(0, query.length - 1);
      query += `):${_model}`
    })
    return query;
  },

  makeResolvers: () => {
    return new Promise( (resolve, reject) => {
      GraphQLService.getModels()
      .then(models => {
        const resolvers = {
          Query: {},
          Mutation: {}
        }
        for (model in models) {
          let _model = model.charAt(0).toUpperCase() + model.slice(1);

          resolvers.Query = {
            [`${model}s`]: (p, data) => {
              return new Promise( (resolve, reject) => {
                console.log(p, data)
                sails.models[model].find()
                .exec((err, list) => {
                  if (err) {
                    return reject(err);
                  }

                  return resolve(list)
                })
              });
            }
          }
          resolvers.Mutation = {
            [`add${_model}`]: (p, data) => {
              return new Promise( (resolve, reject) => {
                sails.models[model].create(data)
                .exec((err, created) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(created);
                })
              });
            },
            [`edit${_model}`]: (p, data) => {
              return new Promise( (resolve, reject) => {
                let {id} = data;
                delete data.id;
                sails.models[model].update({id}, data)
                .exec((err, updated) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(updated);
                })
              });
            },
            [`delete${_model}`]: (p, data) => {
              return new Promise( (resolve, reject) => {
                sails.models[model].destroy({id: data.id})
                .exec((err, updated) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(updated);
                })
              });
            }
          }
        }
        return resolve(resolvers);
      })
    });
  },

  startApollo: () => {
    return new Promise( (resolve, reject) => {
      GraphQLService.makeSchema()
      .then(typeDefs => {
        GraphQLService.makeResolvers()
        .then(resolvers => {
          return resolve({ApolloServer, resolvers, typeDefs, gql});
        }, (err) => {
          reject(err);
        })
      }, (err) => {
        reject(err);
      })
    });
  }
}
