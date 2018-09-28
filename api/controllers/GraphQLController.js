module.exports = {
  graphql: (req, res) => {
    let theAllParams = req.allParams();
    console.log(theAllParams, "params from graph ql client");
    res.ok()
  }
}
