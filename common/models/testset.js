'use strict';

var CONTAINERS_URL = '/api/containers/';
module.exports = function(Testset) {

    Testset.upload = function (ctx,options,cb) {
        if(!options) options = {};
        var Container = Testset.app.models.Container;
        var Soal = Testset.app.models.Soal;
        var idSoal = ctx.req.params.id;
        var saveLocation = "testset"; 
        Container.upload(ctx.req,ctx.res,{container: saveLocation},function uploadAnswercase(err,fileObj){
            if(err){
                cb(err);
            }else{
               console.log(fileObj);
               var fileInfoAnswer = fileObj.files.answercase[0];
               var fileInfoTest = fileObj.files.testcase[0];
               Testset.create({
                   answerName:fileInfoAnswer.name,
                   answerType:fileInfoAnswer.type,
                   answerContainer:saveLocation,
                   answerUrl:CONTAINERS_URL+saveLocation+"/download/"+fileInfoAnswer.name,
                   testName:fileInfoTest.name,
                   testType:fileInfoTest.type,
                   testContainer:fileInfoTest.saveLocation,
                   testUrl:CONTAINERS_URL+saveLocation+"/download/"+fileInfoTest.name,
                   soalId:idSoal
               },function createAnswercase(err,obj){
                   if(err!==null){
                        cb(err);
                   }else{
                        cb(null,obj);
                   }
               });
            }
        });
    };

    Testset.remoteMethod(
        'upload',
        {
            description: 'Uploads answercase ke server',

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
