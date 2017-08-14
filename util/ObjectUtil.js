exports.copySameTypeObject = function(source, target){

  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      var val = source[key];
      target[key] = val;
    }
  }
}
