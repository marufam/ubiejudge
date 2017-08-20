'use strict';

var CONTAINERS_URL = '/api/containers/';
module.exports = function(Answer) {

    Answer.upload = function (ctx,options,cb) {
        if(!options) options = {};
        ctx.req.params.container = 'answer';
        var Container = Answer.app.models.Container;
        var Soal = Answer.app.models.Soal;
        var idSoal = ctx.req.params.id;
        var saveLocation = "answer"; 
        Container.upload(ctx.req,ctx.res,{container: saveLocation},function upload(err,fileObj){
            if(err){
                cb(err);
            }else{
               var fileInfo = fileObj.files.name[0];
               Answer.create({
                   name:fileInfo.name,
                   type:fileInfo.type,
                   container:saveLocation,
                   url:CONTAINERS_URL+saveLocation+"/download/"+fileInfo.name,
                   soalId:idSoal
               },function createTestcase(err,obj){
                   if(err!==null){
                        cb(err);
                   }else{
                        cb(null,obj);
                   }
               });
            }
        });
    };

    Answer.remoteMethod(
        'upload',
        {
            description: 'Uploads jawaban ke server',

            accepts: [
                { arg: 'ctx', type: 'object', http: { source:'context' } },
                { arg: 'options', type: 'object', http:{ source: 'query'} },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {path:"/upload/:id",verb: 'post'}
        }
    );


};
