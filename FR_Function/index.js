const request = require('request');
const url = require('url');
const crypto = require('crypto');
const TableStore = require('tablestore');
const co = require('co');
const RPCClient = require('@alicloud/pop-core').RPCClient;
const config = require("./config");

//iot client
const iotClient = new RPCClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    endpoint: config.iotEndpoint,
    apiVersion: config.iotApiVersion
});
//ots client
const otsClient = new TableStore.Client({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    endpoint: config.otsEndpoint,
    instancename: config.otsInstance,
    maxRetries: 20
});

const options = {
    url: config.dtplusUrl,
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
    }
};

module.exports.handler = function(event, context, callback) {

    var eventJson = JSON.parse(event.toString());

    try {
        var imgUrl = config.ossEndpoint + "/" + eventJson.events[0].oss.object.key;

        options.body = JSON.stringify({ type: 0, image_url: imgUrl });
        options.headers.Date = new Date().toUTCString();
        options.headers.Authorization = makeDataplusSignature(options);

        request.post(options, function(error, response, body) {

            console.log('face/attribute response body:' + body)
            const msg = parseBody(imgUrl, body)
            saveToOTS(msg, callback);
        });
    } catch (err) {
        callback(null, err);
    }
};

parseBody = function(imgUrl, body) {

    body = JSON.parse(body);
    //face_rect [left, top, width, height],
    const idx = parseInt(10 * Math.random() % 4);
    const age = (parseInt(body.age[0])) + "岁";
    const expression = (body.expression[0] == "1") ? config.happy[idx] : config.normal[idx];
    const gender = (body.gender[0] == "1") ? "帅哥" : "靓女";
    const glass = (body.glass[0] == "1") ? "戴眼镜" : "火眼金睛";

    return {
        'imgUrl': imgUrl,
        'gender': gender,
        'faceRect': body.face_rect.join(','),
        'glass': glass,
        'age': age,
        'expression': expression
    };
}

//pub msg to WebApp by IoT
iotPubToWeb = function(payload, cb) {
    co(function*() {
        try {
            //创建设备
            var iotResponse = yield iotClient.request('Pub', {
                ProductKey: config.productKey,
                TopicFullName: config.topicFullName,
                MessageContent: new Buffer(JSON.stringify(payload)).toString('base64'),
                Qos: 0
            });
        } catch (err) {
            console.log('iotPubToWeb err' + JSON.stringify(err))
        }

        cb(null, payload);
    });
}

saveToOTS = function(msg, cb) {
    //不保存进OTS
    // var ots_data = {
    //     tableName: config.tableName,
    //     condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),

    //     primaryKey: [{ deviceId: "androidPhoto" }, { id: TableStore.PK_AUTO_INCR }],

    //     attributeColumns: [
    //         { 'imgUrl': msg.imgUrl },
    //         { 'gender': msg.gender },
    //         { 'faceRect': msg.faceRect },
    //         { 'glass': msg.glass },
    //         { 'age': msg.age },
    //         { 'expression': msg.expression }
    //     ],

    //     returnContent: { returnType: TableStore.ReturnType.Primarykey }
    // }

    //不需要OTS直接推送到Web
    iotPubToWeb(msg, cb);

    // otsClient.putRow(ots_data, function(err, data) {

    //     iotPubToWeb(msg, cb);
    // });
}

makeDataplusSignature = function(options) {

    const md5Body = crypto.createHash('md5').update(new Buffer(options.body)).digest('base64');

    const stringToSign = "POST\napplication/json\n" + md5Body + "\napplication/json\n" + options.headers.Date + "\n/face/attribute"
    // step2: 加密 [Signature = Base64( HMAC-SHA1( AccessSecret, UTF-8-Encoding-Of(StringToSign) ) )]
    const signature = crypto.createHmac('sha1', config.secretAccessKey).update(stringToSign).digest('base64');

    return "Dataplus " + config.accessKeyId + ":" + signature;
}