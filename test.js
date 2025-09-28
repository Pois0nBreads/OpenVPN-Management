#!/usr/bin/env node
//执行环境代码
require('./env.js');
const config = require('./config.js');
//导入openvpn包
const OpenVPNConfig = require('./core/openvpn/config.js');
const OpenVPNCore = require('./core/openvpn/core.js');
//导入iptables包
const IptablesManager = require('./core/iptables/manager.js');
const IptablesRuleBean = require('./core/iptables/ruleBean.js');
//导入Httpserver包
const HttpServer = require('./httpserver/httpServer.js');
const UserController = require('./httpserver/userController.js');



//配置IPtablesManager
let mIptablesManager = new IptablesManager();
mIptablesManager.queryRoleFromCN = cn => {
	return ['TEST_ROLE'];
};
mIptablesManager.createChain('TEST_ROLE', [
	new IptablesRuleBean({ destination: '10.0.0.0/8', target: 'ACCEPT' }),
	new IptablesRuleBean({ destination: '223.5.5.5/32', target: 'ACCEPT' }),
	new IptablesRuleBean({ destination: '192.168.0.0/16', target: 'ACCEPT' })
]);

//配置OpenVPN
let mOpenVPNConfig = new OpenVPNConfig();
let mOpenVPNCore = new OpenVPNCore(mOpenVPNConfig);
mOpenVPNCore.author = (user, pass) => {
	console.log(`user: ${user}, pass: ${pass}`);
	return "0";
};
mOpenVPNCore.startVPN();


let userController = new UserController().create();
let server = new HttpServer(config.httpServer.port);
server.configureServer('user', userController);
server.startServer();

setInterval(() => {
	mOpenVPNCore.manager.getClientList(data => {
		for (let client of data) {
			console.log(`client cn: ${client.commonName} id: ${client.clientID} - ${client.virtualAddress}`);
			if (client.clientID == 0)
				mOpenVPNCore.manager.killClientByID(client.clientID);
		}
	});
}, 5000);