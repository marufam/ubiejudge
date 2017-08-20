'use strict';
var fs = require('fs');
var path = require('path');
var async = require( "async" );
var CONTAINERS_URL = '/api/containers/';
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
module.exports = function(Soal) {

    Soal.test = function (ctx,options,cb) {
        if(!options) options = {};
        var Container = Soal.app.models.Container;
        var idSoal = ctx.req.params.id;
        var saveLocation = "answer"; 
        async.waterfall([
            //upload file
            function (callback){
               Container.upload(ctx.req,ctx.res,{container: saveLocation},function uploadAnswerCase(err,fileObj){
                if(err){
                    return callback(err);
                }else{
                    callback(null,fileObj);
                }
               }); 
            },
            //get soal
            function (fileObj,callback){
                Soal.findById(idSoal,{
                    include:"testsets"
                }, function getSoal(err,res){
                    if(err){
                        callcback(err);
                    }else{
                        var r = res.toJSON();
                        callback(null,fileObj,r);
                    }
                })
            },
            //compile jawaban
            function (fileObj,r,callback){
            var filePath = "files/answer/"+fileObj.files.testfile[0].name;
            var testname = 'data-'+new Date().getTime();
            var testPath = "files/answer/"+testname;
            exec('gcc -o '+testPath+" "+filePath, (error, stdout, stderr) => {
                if (error) {
                        callback(error);
                    }else{
                        callback(null,fileObj,r,testname);
                    }
                });
            },
            //run test jawaban
            //ideally ini pake async paralel 
            function (fileObj,r,testname,callback){
                async.map(r.testsets,function(data,callback){
                    exec('cat files/testset/'+data.testName+' | files/answer/./'+testname, (error, stdout, stderr) => {
                        if (error) {
                            callback(error);
                        }else{
                            // callback(null,stdout);
                            fs.readFile('files/testset/'+data.answerName, 'utf8', function (err,data) {
                                if (err) {
                                    callback(error)
                                }else{
                                    if(data.toString()===stdout.toString()){
                                        callback(null,true);
                                    }else{
                                        callback(null,false);
                                    }
                                }
                            });
                        }
                    });
                },function(error,result){
                    if(error){
                        callback(error);
                    }else{
                        // callback(null,fileObj,r,testname,result);
                        callback(null,result);
                    }
                });
            }
            // ,
            // function(fileObj,r,testname,resultCompile,callback){
            //     async.map(r.testsets,function(data,callback){
            //         fs.readFile('files/testset/'+data.answerName, 'utf8', function (err,data) {
            //             if (err) {
            //                 callback(error)
            //             }else{
            //                 callback(null,data);
            //             }
            //           });
            //     },function(error,result){
            //         if(error){
            //             callback(error);
            //         }else{
            //             callback(null,result);
            //         }
            //     });
            // }
        ],function(err,res){
            if(err) cb(err);
            cb(null,res);
        });
    };

    Soal.remoteMethod(
        'test',
        {
            description: 'Upload jawaban dan test hasilnya',

            accepts: [
                { arg: 'ctx', type: 'object', http: { source:'context' } },
                { arg: 'options', type: 'object', http:{ source: 'query'} },
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {path:"/test/:id",verb: 'post'}
        }
    );

};
