var fetch = require('node-fetch');
var s = require('./suite.js');

const searchData = function(data, query){
    var re = new RegExp(`(${query})`,'i')
    const searchedData = data.filter(function(obj){
        return re.test(obj.name)
    });
    return searchedData
}

const getData = function(response, url, mediaType){
    return fetch(url)
        .then(function(resp){
            return resp.json()
        }).then(function(body){
            return s.refactor(body, mediaType)
        }).catch(function(error){
            console.log(error)
            return error
        })
}

const requestForData = function(response, url, obj, mediaType) {

    query = obj.query
    if (query) {
        return getData(response, url, mediaType).then(function(refactoredData){
            return searchData(refactoredData.data, query)
        }).then(function(refactoredData){
            return response.status(200).send({data:refactoredData, metadata: {cursor:{}}})
        })
    } else {
        return getData(response, url, mediaType).then(function(refactoredData){
            return response.status(200).send({data: refactoredData.data, metadata: refactoredData.metadata})
        })
    }

}

module.exports = {
    requestData: requestForData
};







