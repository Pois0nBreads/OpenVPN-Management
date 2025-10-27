/**
*	package core/iptables/manager.js
**/

const IPLearner = require('./iplearner.js');
const Controller = require('./controller.js')
const RuleBean = require('./ruleBean.js');
const e = require('express');

class Manager {
	
	//初始化IPtables Manager
	constructor() {
		this.run_path = global.run_path;
		this.chainFixed = `OPENVPN_`;
		this.controller = new Controller();
		this.mIPLearner = new IPLearner();
		this.dInitRules();
		this.initRules();
		this.queryRoleFromCN = cn => [];
		
		let _this = this;
		//注册退出事件
		global.onExitTask.push(() => _this.dInitRules());
		
		this.mIPLearner.setOnIPchangeListener((op, addr, cn) => {
			console.log(`Manager Reciver IP Learner Msg - <op: ${op}> <addr: ${addr}> <cn: ${cn}>`);
			_this.ipLearnerHandler(op, addr, cn);
		});
	}
	
	//初始化规则 FIN
	initRules() {
		let contr = this.controller;
		console.log(`初始化IPtables`)
		//创建OVPN相关链
		contr.createChain(contr.inputTable);
		contr.createChain(contr.forwardTable);
		
		console.log(`添加系统链规则`)
		//向系统Forward链添加OVPN规则
		let rule = new RuleBean();
		rule.target = contr.forwardTable;
		rule.in_int = contr.dev;
		contr.addRuleByChainName(contr.sysForwardTable, rule);
		
		//向系统Input链添加OVPN规则
		rule = new RuleBean();
		rule.target = contr.inputTable;
		rule.in_int = contr.dev;
		contr.addRuleByChainName(contr.sysInputTable, rule);
		
		console.log(`添加OVPN链规则`)
		//向OPENVPN_FORWARD添加OVPN链规则
		rule = new RuleBean();
		rule.target = 'DROP';
		contr.addRuleByChainName(contr.forwardTable, rule, true);
		
		//向OPENVPN_INPUT添加OVPN链规则
		rule = new RuleBean();
		rule.target = 'ACCEPT';
		rule.prot = 'icmp';
		contr.addRuleByChainName(contr.inputTable, rule, true);
		rule = new RuleBean();
		rule.target = 'DROP';
		contr.addRuleByChainName(contr.inputTable, rule, true);
	}
	
	//反初始化规则 FIN
	dInitRules() {
		let contr = this.controller;
		console.log(`反初始化IPtables`)
		//删除OVPN相关链
		contr.deleteChain(contr.inputTable);
		contr.deleteChain(contr.forwardTable);
		
		console.log(`删除OVPN链规则`)
		//删除OVPN角色相关链
		let allRules = contr.getAllRules();
		for (let name in allRules)
			if (name.startsWith(this.chainFixed))
				contr.deleteChain(name);
	}
	
	//刷新OPENVPN链
	reflushVPNChain() {
		console.log(`刷新OVPN链规则`)
		let contr = this.controller;
		contr.clearRuleByChainName(contr.inputTable);
		contr.clearRuleByChainName(contr.forwardTable);
		
		//向OPENVPN_FORWARD添加OVPN链规则
		let rule = new RuleBean();
		rule.target = 'DROP';
		contr.addRuleByChainName(contr.forwardTable, rule, true);
		
		//向OPENVPN_INPUT添加OVPN链规则
		rule = new RuleBean();
		rule.target = 'ACCEPT';
		rule.prot = 'icmp';
		contr.addRuleByChainName(contr.inputTable, rule, true);
		rule = new RuleBean();
		rule.target = 'DROP';
		contr.addRuleByChainName(contr.inputTable, rule, true);
	}
	
	//创建角色链 FIN
	createChain(roleName, rules) {
		let contr = this.controller;
		let chainName = this.chainFixed + roleName;
		if (!contr.createChain(chainName)) {
			console.log(`创建角色链失败`);
			return false;
		}
		for (let rule of rules)
			contr.addRuleByChainName(chainName, rule, true);
		return true;
	}
	
	//删除角色链 FIN
	deleteChain(roleName) {
		let contr = this.controller;
		let chainName = this.chainFixed + roleName;
		return contr.deleteChain(chainName);
	}
	
	//收到客户端IP分配事件 FIN
	ipLearnerHandler(op, addr, cn) {
		if (op != 'add' && op != 'update' && op != 'delete') {
			console.log(`未知的OP类型：${op}`);
			return;
		}
		let contr = this.controller;
		//删除旧记录
		let existsRules = contr.getForwardRules();
		for (let i=existsRules.length-1;i > -1;i--) {
			let rule = existsRules[i];
			if (rule.source == addr)
				contr.delRuleByChainNameId(contr.forwardTable, rule.num);
		}
		//添加新记录
		if (op == 'delete')
			return;

		let roles = this.queryRoleFromCN(cn);
		if (roles instanceof Promise) {
			roles.then(data => {
				for (let role of data) {
					let chainName = this.chainFixed + role;
					let rule = new RuleBean({source: addr, target: chainName});
					contr.addRuleByChainName(contr.forwardTable, rule);
				}
			}).catch(e => console.error(e));
		}else {
			for (let role of roles) {
				let chainName = this.chainFixed + role;
				let rule = new RuleBean({source: addr, target: chainName});
				contr.addRuleByChainName(contr.forwardTable, rule);
			}
		}
	}
	
}

module.exports = Manager;