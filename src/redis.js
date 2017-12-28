const jsonify = require('redis-jsonify');
const redisUrl = (process.env.REDIS_URL ? process.env.REDIS_URL: null)
const client = require('then-redis').createClient(redisUrl);
var score = -1;

const randomScoreGen = function(){
    score = score + 1;
    return score
};
const clientCommand = function(cmd, args) {
	return client.send(cmd, args).then(function(result){
		return result;
	});
};

const doesKeyExists = function(userId, currCursor) {
	return clientCommand("zscore", [userId, currCursor]);
};

const savePaginatedCursor = function(userId, score, cursor) {
	return clientCommand("zadd",[userId, score, cursor]);
};

const getCursor = function(userId, index) {
	if (index < 0){
		return null;
	}
	return clientCommand("zrange", [userId, index, index])
};

const getCurrentIndex = function(userId, cursor){
	return clientCommand("zscore", [userId,cursor]);
};

const getTotalCount = function(userId){
	return client("zcount", [userId, -100, 1000]);
}

const refactorRedisForSuite = function(userId, currCursor, cursor) {
	return getCurrentIndex(userId, currCursor).then(function(index){
		return (parseInt(index) - 1);
	}).then(function(index){
		return getCursor(userId, index)
	}).then(function(result){
		if (!result){
			return {"prev":null, "next": cursor};
		} else {
			return {"prev": result[0], "next": cursor}
		}
	});
}
const saveAndGetPaginated = function(userId, currCursor, cursor) {
	if (!(currCursor)) {
		return Promise.resolve({"next": cursor})
	}
	return doesKeyExists(userId, currCursor).then(function(result){
		if (!result){
			score = randomScoreGen();
			return savePaginatedCursor(userId, score, currCursor).then(function(){
				return refactorRedisForSuite(userId, currCursor, cursor);
			});
		} else {
			return refactorRedisForSuite(userId, currCursor, cursor);
		}
	});
};


module.exports = {
	getCursor: getCursor,
	doesKeyExists: doesKeyExists,
	savePaginatedCursor: savePaginatedCursor,
	getTotalCount: getTotalCount,
	getCurrentIndex: getCurrentIndex,
	saveAndGetPaginated: saveAndGetPaginated
}




// const refactorRedisForSuite = function(userId, currCursor) {
// 	return getCurrentIndex(userId, currCursor).then(function(index){
// 		var intIndex = parseInt(index) - 1
// 		if (intIndex == 0){
// 			return {"prev":null, "next":cursor}
// 		} else {
// 			return getCursor(userId,intIndex).then(function(result){
// 				return {"prev":result[0], "next":cursor}
// 			});
// 		}
// 	});
// }
// const saveAndGetPaginated = function(userId, currCursor, cursor) {
// 	return doesKeyExists(userId, currCursor).then(function(result){
// 		if (!result){
// 			score = randomScoreGen();
// 			return savePaginatedCursor(userId, score, currCursor).then(function(){
// 				return refactorRedisForSuite(userId, currCursor);
// 			});
// 		} else {
// 			return refactorRedisForSuite(userId, currCursor);
// 		}
// 	});
// };

// const setUser = function(userId) {
// 	client.rpush(userId)
// }

// const setPagCursor = function(userId, cursor, currKey, newKey) {

// }



// const savePaginationCursor = function (userId, cursor, currKey) {
// 	if (!cursor) {
// 		const randomKey = randomKeyGen();
// 	}
// }

// const savePaginationCursor = function(userId, cursor, currentKey) {
//     if (!(cursor)) {
//         const randomKey = randomKeyGen();
//         redis[userId][randomKey] = {
//             next: null,
//             prev: currentKey,
//             cursor: cursor
//         };
//     }
//     if (!(currentKey)) {
//         redis[userId][currentKey].first = randomKey
//     } else {
//         redis[userId][currentKey].next = randomKey;
//     }
// }
// jsonStore.set("c",{"g":5}, function(err,result){
// 	console.log(result)
// })
// jsonStore.get("user", function(err, result){
// 	jsonStore.set(result['c'],{"l":8},function(err, result){
// 		console.log(result);
// 	});
// });

// const storeUser = function(userId) {
// 	client.hmset(userId,)
// }

// client.hmset("tmpusers", "tmpkey4", '{"key2": "val3"}', function(err,result){
// 	console.log(result);
// });

// client.exists("tmp",function(err,result){
// 	console.log(result)
// });