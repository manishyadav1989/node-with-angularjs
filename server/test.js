/**
 * Manage event process and event structure
 * @author Manish Yadav
 * @copyright Semusi Technologies PVT LTD
 */
const cacheApi = require('./semusi.cache.js'),
    Promise = require('bluebird'),
    common = require('./common'),
    dataProducer = require('./common.data.producer.js');

/**
 * 
 * @param {*} event has an event data
 */
exports.setSessoinCache = function(event){
    cacheApi.setKey('session_'+event.appid+event.sid, event.eventTime);
    cacheApi.expire('session_'+event.appid+event.sid, common.config.sessionKeyExpire * 1000);
}

/**
 * 
 * @param {*} db has object of mongoDB
 * @param {*} event has an event data
 */
exports.processSessionData = function(db, event){
    try{
        // update tsd and lsd in app user collection
        var updatedAt = common.getCurrentEpochTime();
        var duration = 0;
        if(event.duration){
            duration = event.duration;
            processData();
        }
        else{
            getSessionTimeFromCache(event)
                .then((duration) =>{
                    duration = duration;
                    processData();
                })
                .catch((error) =>{
                    
                });
        }
        // process app background data
        function processData(){
            // push app users data into array
            let ausersArray = [{appid:event.appid, op:'update', data:{"_id":event.user_id, $inc:{'tsd':duration},$set:{'lsd':duration, 'ls_st':parseInt(event.eventTime-duration), 'updatedAt':updatedAt}}}];
            // prepare bulk query
            db.collection('app_users'+event.appid).find({"_id":event.user_id}).update({$inc:{'tsd':duration},$set:{'lsd':duration, 'ls_st':parseInt(event.eventTime-duration), 'updatedAt':updatedAt}}, function(error, operation){
                if(error){
                    // send data into queue if mongo got error
                    errorQueue(ausersArray, 'mongo', 'app_users'+event.appid, 'processEndSessionData', function(status){
                        console.log("Error:processBeginSessionData:app_users"+event.appid);
                    });
                }
                else{
                    ausersArray = [];
                    console.log(`operation => ${JSON.stringify(operation)}`);
                }
            });

            // check active user Asl boundary
            common.checkActiveUserAsl(event, function(err, stdata){
                if(stdata){
                    let bulk_timely_user_sessions = db.collection('timely_users_session').initializeUnorderedBulkOp();
                    // push end session optimisation query into array
                    let tusessionArray = [{appid:event.appid, op:'update', isUpsert:true, data:stdata, key:'$inc', keyData:'updateSessionUserObj'}];
                    for(var j=0; j<stdata.length; j++){
                        bulk_timely_user_sessions.collection('timely_users_session').find({'_id':stdata[j].id}).upsert().update({'$inc': stdata[j].updateSessionUserObj});
                    }
                    // execute bulk query
                    bulk_timely_user_sessions.execute(function(err, result){
                        if (err){
                            // send data into queue if mongo got error
                            errorQueue(tusessionArray, 'mongo', 'timely_users_session', 'processEndSessionData', function(status){
                                console.log("Error:processBeginSessionData:bulk_timely_user_sessions");
                            });
                        }
                        else{
                            tusessionArray = [];
                            console.log(`result => ${JSON.stringify(result)}`);
                        }
                    });                  
                }
            });
        }
    }
    catch(err){
        console.log(`error => ${err} appid => ${event.appid} user_id => ${event.user_id} and did => ${event.did}`);
    }
}

function getSessionTimeFromCache (event){
    return new Promise ((resolve, reject) =>{
        cacheApi.getKey('session_'+event.appid+event.sid, (error, eventTime) =>{
            if(error && eventTime == null){
                getSessionTimeFromDB(event.appid, event.user_id)
                    .then((ls_st) =>{
                        return resolve(parseInt(ls_st));
                    })
                    .catch((error) =>{
                        return reject("Event time not found");
                    })
            }
            else{
                return resolve(parseInt(eventTime));
            }
        });
    });
}

function getSessionTimeFromDB (appid, user_id){
    return new Promise ((resolve, reject) =>{
        common.collection('app_users'+appid).findOne({_id:user_id}, function(error, user){
            if(error){
                return reject(error);
            }
            else{
                return resolve(user.ls_st);
            }
        });
    });
}

// send data to error queue
function errorQueue (eventsData, type, col, method, callback){
    var obj = {
        method  : method,
        col		: col,
        type 	: type,
        events  : eventsData,
        key 	: "errors"
    };
    dataProducer.writeDataToSQS(obj, function(status){
        if(callback){
            return callback(status);
        }
        return;
    });
}

exports.errorQueue = errorQueue;