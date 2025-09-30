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
//导入DAO包
const UserDAO = require('./dao/userDAO.js');
const RoleDAO = require('./dao/roleDAO.js');
const NetworkDAO = require('./dao/networkDAO.js');

//初始化数据库
let networkDAO = new NetworkDAO(config.dataBase);
let userDao = new UserDAO(config.dataBase);
let roleDAO = new RoleDAO(config.dataBase);


//配置IPtablesManager
let mIptablesManager = new IptablesManager();
//从数据库添加防火墙网段
let network_map = {};
networkDAO.getAllNetworks()
.then(datas => {
	for (let data of datas) {
		console.log(data);
		network_map[data.uid] = [];
		for (let network of data.networks) {
			network_map[data.uid].push(new IptablesRuleBean({ destination: network, target: 'ACCEPT' }));
		}
	}
	return roleDAO.getAllRoles();
})
.then(datas => {
	for (let role of datas) {
		console.log(role);
		let nets = [];
		for (let uid of role.networks) {
			let networks = network_map[uid];
			for (let net of networks) {
				nets.push(net);
			}
		}
		mIptablesManager.createChain(role.uid, nets);
	}
});
//从数据库获取对应用户的角色防火墙规则
mIptablesManager.queryRoleFromCN = async (cn) => {
	let roles = [];
	try {
		let user = await userDao.getUserByName(cn);
		roles = user.roles;
	} catch(e) {
		console.error(e);
	}
	return roles;
};

//配置OpenVPN
let mOpenVPNConfig = new OpenVPNConfig();
let mOpenVPNCore = new OpenVPNCore(mOpenVPNConfig);
//配置验证
mOpenVPNCore.author = async (user, pass) => {
	console.log(`user: ${user}, pass: ${pass}`);
	let result = await userDao.authLogin(user, pass);
	switch (result) {
		case 0:// 登录成功
			return '0';
		case 1:// 用户不存在
			return '2';
		case 2:// 密码错误
			return '1';
		default:
			return '-1';
	}
};
//配置路由下发
mOpenVPNCore.clientConfigGetter = async (user) => {
	console.log(`clientConfigGetterUser: ${user}`);
	try {
		let routes = "";
		let userInfo = await userDao.getUserByName(user);
		console.debug(userInfo);
		for (let roleID of userInfo.roles) {
			let role = await roleDAO.getRoleByUID(roleID);
			console.debug(role);
			for (let networkID of role.networks) {
				let networkList = await networkDAO.getNetworkByUID(networkID);
				console.debug(networkList);
				for (let network of networkList.networks) {
					routes += `push "route ${networkDAO.cidrToRange(network).toString()}"\n`;
				}
			}
		}
		console.log(`clientConfigGetter List: \n${routes}`);
		return routes;
	} catch (error) {
		console.log(error);
		return "";
	}
};
mOpenVPNCore.startVPN();

//配置Http服务器
let userController = new UserController().create();
let server = new HttpServer(config.httpServer.port);
server.configureServer('user', userController);
server.startServer();

// setInterval(() => {
// 	mOpenVPNCore.manager.getClientList(data => {
// 		for (let client of data) {
// 			console.log(`client cn: ${client.commonName} id: ${client.clientID} - ${client.virtualAddress}`);
// 			if (client.clientID == 0)
// 				mOpenVPNCore.manager.killClientByID(client.clientID);
// 		}
// 	});
// }, 5000);