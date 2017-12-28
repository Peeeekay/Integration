var fetch = require('node-fetch');
var s = require('./suite.js');

//search for data
const searchData = function(refactorData, query) {
    if (!(query)) {
       var re = new RegExp(`(${query})`,'i')
       const searchedData = data.filter(function(obj){
            return re.test(obj.name)
        });
         return Promsie.resolve({data:searchedData, metadata:refactorData.metadata})
    }
    return Promise.resolve(refactorData)  
}

//filter by media type
const filterByMediaType = function(refactorData, mediaType) {
    if (!(mediaType)) {
        const filteredData = refactorData.data.filter(function(obj) {
            return obj["mediaType"] ===  mediaType                    
        });
        return Promsie.resolve({data:filteredData, metadata:refactorData.metadata})
    }
    return Promise.resolve(refactorData)
}

const getData = function(url){
    return fetch(url)
        .then(function(resp){
            return resp.json()
        }).then(function(body){
            return s.refactor(body, mediaType)
        }).catch(function(error){
            return error
        })
}

const requestForData = function(response, url, obj) {
    mediaType = obj.mediaType
    query = obj.query
    
    return getData(url)
        .then(function(refactorData){
            return filterByMediaType(refactorData, mediaType)
        }).then(function(refactorData){
            return searchData(refactorData, query)
        }).then(function(refactorData){
           return response.status(200).send({data: refactorData.data, metadata: refactorData.metadata})  
        }).catch(function(error){
            return error
        })
}

module.exports = {
    requestData: requestForData
};







