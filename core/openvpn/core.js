/**
*	package core/openvpn/core.js
**/
//引入包
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const Manager = require('./manager.js');

//定义常量
const SOCKET_PATH = path.join('/tmp', 'openvpn.passwd.sock');

class OpenVPNCore {
	
	//初始化OpenVPN核心
	constructor(config) {
		this.run_path = global.run_path;
		this.config = config;
		this.author = (user, pass) => '1';
		this.process = null;
		this.isRun = false;
		this.manager = new Manager();
		this.initIPC();
	}
	
	//初始化验证通信
	initIPC() {
		if (fs.existsSync(SOCKET_PATH))
			fs.unlinkSync(SOCKET_PATH);
		net.createServer((socket) => {
			console.log(`OpenVPN Core Auther 客户端发起验证请求`);
			
			socket.on('data', (data) => {
				const msg = data.toString();
				try {
					let username = msg.split('\n')[0];
					let password = msg.split('\n')[1];

					let result = this.author(username, password);
					if (result instanceof Promise)
						result.then(data => {
							socket.write(data);
							socket.end();
						}).catch(e => console.error(e));
					else {
						socket.write(result);
						socket.end();
					}

				} catch(e) {
					console.log(e);
					console.log(`未知的客户端`);
					socket.end();
				}
			});

			socket.on('end', () => {
				//console.log('OpenVPN Core Auther 客户端断开连接');
			});

			socket.on('error', (err) => {
				console.error(`OpenVPN Core Auther 客户端出现错误:`, err);
			});
		}).listen(SOCKET_PATH, () => {
			console.log(`OpenVPN Core Auther 服务监听在 ${SOCKET_PATH}`);
		});
	}
	
	statusVPN() {
		return this.isRun;
	}
	
	startVPN() {
		if (this.isRun)
			return;
		this.isRun = true;
		this.process = spawn('openvpn', this.config.getStartParams(), {
			env: process.env,
			PATH: process.env.PATH,
			shell:true
		});
		
		let _this = this;
		let manager = this.manager;
		global.onExitTask.push(() => _this.stopVPNonError());

		this.process.stdout.on('data', (data) => {
			data = data.toString();
			console.log(data);
			if (data.match('Initialization Sequence Completed')) {
				console.log(`守护进程已启动 PID: ${_this.process.pid}`);
				manager.disconnect();
				manager.connect();
			}
		});
		
		this.process.on('error', (err) => {
			console.error(`进程启动失败: ${err.message}`);
			manager.disconnect();
			this.isRun = false;
		});

		this.process.on('exit', (code) => {
			console.warn(`进程异常退出，代码: ${code}`);
			manager.disconnect();
			this.isRun = false;
		});

		//this.process.unref();

	}
	
	stopVPNonError() {
		try {
			this.process.kill();
			console.log(`主程序退出关闭OpenVPN线程`);
		} catch(e) {
			console.log(`无法关闭OpenVPN线程: ${e}`);
		}
	}
	
	stopVPN() {
		if (!this.isRun)
			return;
		process.kill(this.process.pid);
		console.log(`已终止进程组: ${this.process.pid}`);
		this.isRun = false;
	}
}


module.exports = OpenVPNCore;