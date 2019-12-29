const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();

module.exports = async (_, res) => {

  let queryCandidates = datastore
        .createQuery("Event")
        .select('__key__')
        .filter('startDate', '<', new Date());
  
  const [keysOfCandidates] = (await datastore.runQuery(queryCandidates));

  const deletions = keysOfCandidates.map(key => ({ key: key, deleted: true }));
  const results = await datastore.merge(deletions);
  console.log(results);
  
  res.json("OK");
}

