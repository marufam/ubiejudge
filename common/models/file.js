'use strict';

var CONTAINERS_URL = '/api/containers/';
module.exports = function(File) {

    File.upload = function (ctx,options,cb) {
        if(!options) options = {};
        ctx.req.params.container = 'testcase';
        var Container = File.app.models.Container;
        var Soal = File.app.models.Soal;
        var idSoal = ctx.req.params.id;
        console.log(idSoal);
        Container.upload(ctx.req,ctx.res,{container: "testcase"},function(err,fileObj){
            if(err){
                cb(err);
            }else{
               var fileInfo = fileObj.files.name[0];
               console.log(fileInfo);
               File.create({
                   name:fileInfo.name,
                   type:fileInfo.type,
                   container:"testcase",
                   url:CONTAINERS_URL+"testcase/download/"+fileInfo.name
               },function(err,obj){
                   if(err!==null){
                        cb(err);
                   }else{
                       Soal.findById(idSoal,function(err,soal){
                           if(err){
                                cb(err);
                           }else{
                                cb(null,soal);
                           }
                       });
                   }
               });
            }
        });
    };

    File.remoteMethod(
        'upload',
        {
            description: 'Uploads a file',

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