function handleLeaguesRequest(req, res) {
    const userId = req.params.userId;
    knex('leagues').where({ player_id: userId }).then(leagues => {
      res.json(leagues);
    }).catch(err => {
      // Handle error
    });
  }