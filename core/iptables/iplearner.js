/**
*	package core/iptables/iplearner.js
**/
//引入包
const net = require('net');
const path = require('path');
const fs = require('fs');

//定义常量
const SOCKET_PATH = path.join('/tmp', 'openvpn.iplearn.sock');

class IPLearner {
	
	//初始化vpnIP接收服务
	constructor() {
		this.run_path = global.run_path;
		this.initIPC();
	}
	
	//初始化IP接收通信
	initIPC() {
		if (fs.existsSync(SOCKET_PATH))
			fs.unlinkSync(SOCKET_PATH);
		net.createServer((socket) => {
			console.log(`IP Learner 接收到客户端IP变化信号`);
			socket.on('data', (data) => {
				const msg = data.toString();
				try {
					let op = msg.split('\n')[0];   //操作类型
					let addr = msg.split('\n')[1]; //地址
					let cn = msg.split('\n')[2];   //客户端名称
					this.onIPchangeListener(op, addr, cn); //触发回调
				} catch(e) {
					console.log(e);
					console.log(`处理客户端信号时出现异常`);
				}
				socket.end();
			});

			socket.on('error', (err) => {
				console.error('IP Learner 对端出现错误:', err);
			});
		}).listen(SOCKET_PATH, () => {
			console.log(`IP Learner 服务监听在 ${SOCKET_PATH}`);
		});
	}
	
	/**
	* 设置IP变化回调
	* listener回调格式：
	* function(op, addr, cn) {}
	* op:   操作类型
	* addr: 地址
	* cn:   客户端名称
	*/
	setOnIPchangeListener(listener) {
		this.onIPchangeListener = listener;
	}
}

module.exports = IPLearner;
