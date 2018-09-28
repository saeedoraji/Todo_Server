/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  GraphQLService.startApollo()
  .then((apollo) => {
    const server = new apollo.ApolloServer({
      typeDefs: apollo.gql`${apollo.typeDefs}`,
      resolvers: apollo.resolvers,
    });
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    }, (err) => {
      console.log(err)
    });
    cb();
  }, (err) => {
    console.log(err, "error in graph ql");
    cb();
  })
};
