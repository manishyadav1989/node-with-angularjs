/**
 * Utility file
 * @author Manish Yadav
 */
const mongojs = require('mongojs'),
        crypto = require('crypto'),
        config = require('config');
        
// establish connection with mongodb
exports.db = mongojs(config.get('MONGODB'), []);
// generate has
exports.generateHash = function(string){
   return crypto.createHash('sha1').update(string + config.get('HASH') + "").digest('hex');
} 
// validate params
exports.validation = function(args, argProperties){
    var returnObj = {};

    if (!args) {
        return false;
    }

    for (var arg in argProperties) {            
        if (argProperties[arg].required) {                
            if (args[arg] === void 0) {
                return false;                    
            }
        }

        if (args[arg] !== void 0 && args[arg] != '') {
            if (argProperties[arg].type) {
                if (argProperties[arg].type === 'Number' || argProperties[arg].type === 'String') {                        
                    if (toString.call(args[arg]) !== '[object ' + argProperties[arg].type + ']') {
                        return false;
                    }
                } else if (argProperties[arg].type === 'Boolean') {
                    if (!(args[arg] !== true || args[arg] !== false || toString.call(args[arg]) !== '[object Boolean]')) {
                        return false;
                    }
                } else if (argProperties[arg].type === 'Array') {
                    if (!Array.isArray(args[arg])) {
                        return false;
                    }
                } 
                else if (argProperties[arg].type === 'JSON') {
                                            
                }else {
                    return false;
                }
            } else {
                if (toString.call(args[arg]) !== '[object String]') {
                    return false;
                }
            }

            if (argProperties[arg]['max-length']) {
                if (args[arg].length > argProperties[arg]['max-length']) {
                    return false;
                }
            }

            if (argProperties[arg]['min-length']) {
                if (args[arg].length < argProperties[arg]['min-length']) {
                    return false;
                }
            }

            if (!argProperties[arg]['exclude-from-ret-obj']) {
                returnObj[arg] = args[arg];
            }
        }
        else{
            return false;
        }
    }

    return returnObj;
}