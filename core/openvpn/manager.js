/**
*	package core/openvpn/manager.js
**/
//引入包
const net = require('net');
const path = require('path');
const ClientBean = require('./clientBean.js');

//定义常量
const SOCKET_PATH = path.join('/tmp', 'openvpn.management.sock');

class Manager {
	
	constructor() {
		this.run_path = global.run_path;
		this.isRun = false;
		this.client = null;
		this.latestClientList = [];
		this.latestClientListTime = 0;
	}
	//连接管理
	connect() {
		if (this.isRun)
			return;
		this.isRun = true;
		let _this = this;
		this.client = net.createConnection(SOCKET_PATH, () => {
			console.log('已连接到OpenVPN管理频道');
		});
		this.client.on('end', () => {
			console.log('已从OpenVPN管理频道断开连接');
			_this.isRun = false;
		});
		this.client.on('data', (data) => {
			try {
				data = data.toString();
				for (let line of data.split('\n')) {
					line = line.replace(/\r$/, '');
					let raw = line.split(',');
					//如果是HEADER 并且类型是CLIENT_LIST，更新latestClientList
					if (raw[0] == 'HEADER' && raw[1] == 'CLIENT_LIST') {
						_this.latestClientList = [];
						_this.latestClientListTime = new Date().getTime();
					}
					//如果类型是CLIENT_LIST，添加记录到latestClientList
					if (raw[0] == 'CLIENT_LIST') {
						_this.latestClientList.push(new ClientBean(raw));
					}
				}
			} catch(e) {
				console.log(e);
			}
		});
	}
	//断开管理连接
	disconnect() {
		if (!this.isRun)
			return;
	}
	//获取当前在线客户端列表
	getClientList(callback) {
		if (!this.isRun)
			return;
		this.client.write('status 2\n');
		let _this = this;
		setTimeout(()=>{
			callback(_this.latestClientList, _this.latestClientListTime);
		}, 100);
	}
	//根据ID断开某个客户端
	killClientByID(id) {
		if (!this.isRun)
			return;
		this.client.write(`client-kill ${id} "HALT"\n`);
		this.client.write('status 2\n');
	}
	
}
module.exports = Manager;