module.exports = function(app){
    app.dataSources.storage.connector.getFilename = function (file, req, res) {
      //file.name is original filename uploaded
      var fileName = file.name.replace(/\s+/g, '-').toLowerCase();
      return 'data-' + new Date().getTime() + '-' + fileName;
      return filename;
    }
};