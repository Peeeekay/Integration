var easyimg = require('easyimage');
var fetch = require('node-fetch');
// const redis = require('./redis.js');

const randomStringGen = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

const mediaData = {
    gif: "gif",
    image:"image",
    folder:"Folder"
};

const Constant = {
    FOLDER:"FOLDER",
    IMAGE :"IMAGE"
};

const mimeData = {
    jpeg :"image/jpeg",
    jpg  :"image/jpeg",
    png :"image/png",
    gif :"image/gif",
    folder:"application/vnd.hootsuite.folder"
};

const respData = function(id, name, mediaType, mimeType, original, thumbnail){

    return {
        id :id,
        name :name,
        mediaType :mediaType,
        mimeType :mimeType,
        original :(original ? original :null),
        thumbnail :(thumbnail ? thumbnail :null)
    }
};

const getMimeType = function(obj){
    return mimeData[obj[obj.length - 1]]
};
const getMediaType = function(obj){
    return (obj[obj.length - 1] === "gif" ? mediaData["gif"] : mediaData["image"])
};

const extractBytes = function(url) {
    return fetch(url).then(function(resp){
        return resp.headers.get('content-length')
    }).catch(error => {
        return error
    })
}

const extractData = function(obj, mediaType){
    const url = obj.image.original.url.replace("s-media-cache-ak0","i")
    const bytes = extractBytes(url)
    return Promise.all([bytes]).then(sizeInBytes => {
        const media =  getMediaType(obj.image.original.url.split("."));
        const thumbnail = (obj.image ? {url: url, width:100, height:100} :null);
        const original=   (obj.image ? {url: url, width:obj.image.original.width, height: obj.image.original.height, sizeInBytes: parseInt(sizeInBytes[0])} :null);
        const mime  =    getMimeType(obj.image.original.url.split("."));
        return Promise.resolve([media, original, mime, original])
    })
    return Promise.resolve(null)
}

const refactorResponse = function(body, mediaType) {
    var metadata = {cursor:{}}
    if (body.page){
        metadata = ((body.page.cursor)? {cursor: {next: body.page.cursor}}: {cursor:{}})
    }

    const refactoredData = body.data.map(function(obj) {
       if (!(obj.board)|| mediaType === "folder" ) {
            return Promise.resolve(respData(obj.id, obj.name,mediaData.folder, mimeData.folder))
       }
       return extractData(obj, mediaType).then(function(data){
            return respData(obj.id, obj.note, data[0], data[2], data[1], data[3])
        });
    });
   
    return Promise.all(refactoredData).then(function(data){
        if (mediaType !== "folder" && mediaType != null) {
            var filterData = data.filter(function(obj){
                return (obj.mediaType === mediaType)
            })
            return {data:filterData, metadata:metadata}
        }
        return {data:data, metadata:metadata};
    });
};

module.exports = {
    refactor: refactorResponse
};
