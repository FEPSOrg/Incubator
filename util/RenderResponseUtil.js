module.exports = {
  sendResponse : function(code, data, messages, res){
    res.json({
      "code" : code,
      "data" : data,
      "messages" : messages
    });
  }
}
