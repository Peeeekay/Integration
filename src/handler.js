var r =  require('./request.js');
const ACCESS_TOKEN=process.env.ACCESS_TOKEN;

const isNumeric = function (n) {
  return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
}

const validateParentId = function(id) {
    return isNumeric(id)
}

const parseRequest = function(response, obj){
    var url = "";
    const qs =        obj['qs']
    const access =    obj["access"]
    const TOKEN =     (access ? access.split(" ")[1] : ACCESS_TOKEN)
    const cursor =    (qs["cursor"] ? qs["cursor"] : "");
    const pageSize =  (qs["pageSize"] ? qs["pageSize"] : 25);
    const mediaType = (qs["mediaType"] ? qs["mediaType"] : null);
    const parentId =  (qs['parentId']? qs["parentId"]: null)
    const query =     (qs["query"] ? qs['query']: null)
    
    if (query && parentId){
        //nested search
        url = `https://api.pinterest.com/v1/boards/${parentId}/pins/?access_token=${TOKEN}&fields=id%2Clink%2Cnote%2Curl%2Cmetadata%2Cmedia%2Cboard%2Coriginal_link%2Cnote%2Cimage%2Ccounts&limit=100`
    } else if (query) {
        //global search
        url = `https://api.pinterest.com/v1/me/pins/?access_token=${TOKEN}&fields=id%2Clink%2Cnote%2Curl%2Cmetadata%2Cmedia%2Cboard%2Coriginal_link%2Cnote%2Cimage%2Ccounts&limit=100`
    } else if (parentId){
        //get pins
        url = `https://api.pinterest.com/v1/boards/${parentId}/pins/?access_token=${TOKEN}&cursor=${cursor}&fields=id%2Clink%2Cnote%2Curl%2Cmetadata%2Cmedia%2Cboard%2Coriginal_link%2Cnote%2Cimage%2Ccounts&limit=${pageSize}`
    } else {
        //get boards
       url = `https://api.pinterest.com/v1/me/boards/?access_token=${TOKEN}&fields=id%2Cname%2Curl`
    }
    return r.requestData(response, url, {parentId:parentId, query:query, mediaType:mediaType})
};

module.exports = {
    handleRequest: parseRequest
};
