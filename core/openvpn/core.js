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
const PASSWD_SOCKET_PATH = path.join('/tmp', 'openvpn.passwd.sock');
const ROUTE_SOCKET_PATH = path.join('/tmp', 'openvpn.route.sock');

class OpenVPNCore {
	
	//初始化OpenVPN核心
	constructor(config) {
		this.run_path = global.run_path;
		this.config = config;
		this.author = (user, pass) => '1';
		this.clientConfigGetter = (user) => `push "route ${this.config.server_net} ${this.config.server_mask}"\n`;
		this.process = null;
		this.isRun = false;
		this.manager = new Manager();
		this.initAuterIPC();
		this.initDynamicRouteIPC();
	}
	
	//初始化验证通信
	initAuterIPC() {
		if (fs.existsSync(PASSWD_SOCKET_PATH))
			fs.unlinkSync(PASSWD_SOCKET_PATH);
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
					console.log(`未知的Auther客户端`);
					socket.end();
				}
			});

			socket.on('end', () => {
				//console.log('OpenVPN Core Auther 客户端断开连接');
			});

			socket.on('error', (err) => {
				console.error(`OpenVPN Core Auther 客户端出现错误:`, err);
			});
		}).listen(PASSWD_SOCKET_PATH, () => {
			console.log(`OpenVPN Core Auther 服务监听在 ${PASSWD_SOCKET_PATH}`);
		});
	}
	
	//初始化动态路由通信
	initDynamicRouteIPC() {
		if (fs.existsSync(ROUTE_SOCKET_PATH))
			fs.unlinkSync(ROUTE_SOCKET_PATH);
		net.createServer((socket) => {
			console.log(`OpenVPN Dynamic Route 客户端发起请求`);
			
			socket.on('data', (data) => {
				const user = data.toString();
				try {
					let routes = this.clientConfigGetter(user);
					if (routes instanceof Promise)
					routes.then(data => {
							socket.write(data);
							socket.end();
						}).catch(e => console.error(e));
					else {
						socket.write(routes);
						socket.end();
					}

				} catch(e) {
					console.log(e);
					console.log(`未知的Dynamic Route客户端客户端`);
					socket.end();
				}
			});

			socket.on('end', () => {
				//console.log('OpenVPN Dynamic Route 客户端断开连接');
			});

			socket.on('error', (err) => {
				console.error(`OpenVPN Dynamic Route 客户端出现错误:`, err);
			});
		}).listen(ROUTE_SOCKET_PATH, () => {
			console.log(`OpenVPN Dynamic Route 服务监听在 ${ROUTE_SOCKET_PATH}`);
		});
	}
	
	/**
	 * 查询OpenVPN线程运行状态
	 * @returns Boolean
	 */
	statusVPN() {
		return this.isRun;
	}
	
	/**
	 * 启动OpenVPN线程
	 * @returns void
	 */
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
	
	/**
	 * 主程序退出关闭OpenVPN线程
	 */
	stopVPNonError() {
		try {
			this.process.kill();
			console.log(`主程序退出关闭OpenVPN线程`);
		} catch(e) {
			console.log(`无法关闭OpenVPN线程: ${e}`);
		}
	}
	
	/**
	 * 停止OpenVPN线程
	 * @returns void
	 */
	stopVPN() {
		if (!this.isRun)
			return;
		process.kill(this.process.pid);
		console.log(`已终止进程组: ${this.process.pid}`);
		this.isRun = false;
	}
}


module.exports = OpenVPNCore;