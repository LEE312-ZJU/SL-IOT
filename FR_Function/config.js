/*
 * @Descripttion: 
 * @version: 
 * @Author: Xuan
 * @Date: 2020-05-29 10:11:04
 * @LastEditors: Xuan
 * @LastEditTime: 2020-05-29 10:47:37
 */ 
module.exports = {
    //以下两项是TableStore的秘钥
    accessKeyId: 'LTAI4GAVkasK6auBTsmyC8KD',
    secretAccessKey: 'w32IeUoObydK1VnZDmhhhsLft4LWj0',
    iotEndpoint: 'https://iot.cn-shanghai.aliyuncs.com',
    iotApiVersion: '2018-01-20',

    //Web大屏的产品名和传输识别结果的Topic
    productKey: 'a182iXev2Ka',
    topicFullName: '/a182iXev2Ka/demo_web/user/result',

    dtplusUrl: "https://dtplus-cn-shanghai.data.aliyuncs.com/face/attribute",
    ossEndpoint: "detect-face-photo.oss-cn-shanghai.aliyuncs.com",

    //自定义展示效果部分
    happy:[
        "欢天喜地",
        "好开心呀",
        "哈哈哈哈",
        "乐乐呵呵"
    ],

    normal:[
        "镇定自若",
        "稳操胜券",
        "稳稳稳~",
        "来笑一个"
    ]

// 可选，如果不保存结果，不需要ots
//     otsEndpoint: 'ots接入点',
//     otsInstance: 'ots实例',
//     tableName: 'ots结果存储表',
}