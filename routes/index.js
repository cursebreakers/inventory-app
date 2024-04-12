var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  const userIP = req.ip;
  console.log('Root requested. Redirecting user @IP: ', userIP)
  res.redirect('/inventory');
});

module.exports = router;
