/**
*	package core/openvpn/config.js
**/

class OpenVPNConfig {
	
	constructor() {
		this.run_path		= global.run_path;
		this.ssl_path		= this.run_path + 'ssl/';
		this.verif_script	= this.run_path + 'core/openvpn/passwd.py';
		this.iplearn_script	= this.run_path + 'core/openvpn/iplearn.py';
		this.local			= "0.0.0.0";			//本地监听地址
		this.port			= "1194";				//本地监听端口
		this.dev			= "tun0";				//本地服务设备
		this.proto			= "tcp";				//协议类型
		this.server_net		= "192.168.110.0";		//VPN虚拟网段
		this.server_mask	= "255.255.255.0";		//VPN虚拟掩码
		this.chiper			= "AES-256-CBC";		//VPN加密协议
		this.push_list 	= ["route 192.168.110.0 255.255.255.0"];//客户端推送路由
		
		if (typeof(options) == 'object')
			Object.assign(this, options);
	}
	//生成启动命令行
	getStartCommand() {
		let exec_cmd = `openvpn ` +
				`--local ${this.local} ` +
				`--mode server ` +
				`--port ${this.port} ` +
				`--dev ${this.dev} ` +
				`--proto ${this.proto} ` +
				`--topology subnet ` +
				`--verify-client-cert none ` +
				`--username-as-common-name ` +
				`--auth-user-pass-verify ${this.verif_script} via-env ` +
				`--learn-address ${this.iplearn_script} ` +
				`--script-security 3 ` +
				`--server ${this.server_net} ${this.server_mask} ` +
				`--client-to-client ` +
				`--duplicate-cn ` +
				`--cipher ${this.chiper} ` +
				`--keepalive 10 180 ` +
				`--persist-key ` +
				`--persist-tun ` +
				`--management /tmp/openvpn.management.sock unix` +
				`--verb 4 ` +
				`--ca ${this.ssl_path}ca ` +
				`--cert ${this.ssl_path}cert ` +
				`--key ${this.ssl_path}key ` +
				`--dh ${this.ssl_path}dh `;
		for (let push_item of this.push_list)
			exec_cmd += ` --push "${push_item}" `
		return exec_cmd;
	}
	//生成启动参数列表
	getStartParams() {
		let params = [
				`--mode` , `server`,
				`--local` , `${this.local}`,
				`--port`, `${this.port}`,
				`--dev`, `${this.dev}`,
				`--proto`, `${this.proto}`,
				`--topology`, `subnet`,
				`--verify-client-cert`, `none`,
				`--username-as-common-name`,
				`--auth-user-pass-verify`, `${this.verif_script}`, `via-env`,
				`--learn-address`, `${this.iplearn_script}`,
				`--script-security`, `3`,
				`--server`, `${this.server_net}`, `${this.server_mask}`,
				`--client-to-client`,
				`--duplicate-cn`,
				`--cipher`, `${this.chiper}`,
				`--keepalive`, `10`, `180`,
				`--persist-key`,
				`--persist-tun`,
				`--management`, `/tmp/openvpn.management.sock`, `unix`,
				`--verb`, `4`,
				`--ca`, `${this.ssl_path}ca`,
				`--cert`, `${this.ssl_path}cert`,
				`--key`, `${this.ssl_path}key`,
				`--dh`, `${this.ssl_path}dh`
			];
		for (let push_item of this.push_list) {
			params.push(`--push`);
			params.push(`"${push_item}"`);
		}
		return params;
	}
	
}
module.exports = OpenVPNConfig;
