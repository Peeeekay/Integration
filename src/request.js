var fetch = require('node-fetch');
var s = require('./suite.js');

//search for data
const searchData = function(refactorData, query) {
    if (query !== null) {
        var re = new RegExp(`(${query})`,'i')
        const searchedData = refactorData.data.filter(function(obj){
            return re.test(obj.name)
        });
        return Promise.resolve({data:searchedData, metadata:refactorData.metadata})
    }
    return Promise.resolve(refactorData)  
}

//filter by media type
const filterByMediaType = function(refactorData, mediaType) {
    if (mediaType !== null) {
        const filteredData = refactorData.data.filter(function(obj) {
            return obj["mediaType"] ===  mediaType                    
        });
        return Promise.resolve({data:filteredData, metadata:refactorData.metadata})
    }
    return Promise.resolve(refactorData)
}

//fetch for media data
const getData = function(url){
    return fetch(url)
        .then(function(resp){
            return resp.json()
        }).then(function(body){
            return s.refactor(body)
        }).catch(function(error){
            return error
        })
}

const requestForData = function(response, url, obj) {
    mediaType = obj.mediaType
    query = obj.query
    
    return getData(url)
        .then(refactorData => {
            return filterByMediaType(refactorData, mediaType)
        }).then(refactorData => {
            return searchData(refactorData, query)
        }).then(refactorData => {
            return response.status(200).send({data: refactorData.data, metadata: refactorData.metadata})  
        }).catch(error => {
            console.log(error)
            return error
        })
}

module.exports = {
    requestData: requestForData
};







