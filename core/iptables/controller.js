/**
*	package core/iptables/controller.js
**/
//导入包
const { execSync } = require('child_process');

const RuleBean = require('./ruleBean.js');

class Controller {
	
	//初始化IPtables Controller
	constructor() {
		this.run_path = global.run_path;
		this.sysInputTable 		= 'INPUT';
		this.sysForwardTable 	= 'FORWARD';
		this.inputTable 		= 'OPENVPN_INPUT';
		this.forwardTable 		= 'OPENVPN_FORWARD';
		this.dev 				= 'tun0';
	}
	
	//获取进入规则 FIN
	getInputRules() {
		return this.getRulesListByChainName(this.inputTable);
	}
	
	//获取转发规则 FIN
	getForwardRules() {
		return this.getRulesListByChainName(this.forwardTable);
	}
	
	//获取系统进入规则 FIN
	getSysInputRules() {
		return this.getRulesListByChainName(this.sysInputTable);
	}
	
	//获取系统转发规则 FIN
	getSysForwardRules() {
		return this.getRulesListByChainName(this.sysForwardTable);
	}
	
	//根据链名获取规则 FIN
	getRulesListByChainName(chainName) {
		let rules = [];
		const output = execSync(`iptables -t filter -L ${chainName} -vn --line-numbers`); 
		let result = output.toString().split('\n');
		
		//去掉头尾无用数据
		result.shift();
		result.shift();
		result.pop();
		
		//格式话规则
		for (let raw of result)
			rules.push(new RuleBean(raw));
		return rules;
	}
	
	//获取全部规则 FIN
	getAllRules() {
		const output = execSync(`iptables -t filter -L -vn --line-numbers`); 
		let result = output.toString().split('\n').filter(Boolean);
		
		let rules = {};
		let currentChain = null;
		for (let raw of result) {
			if (raw.startsWith('Chain')) {
				currentChain = raw.split(' ')[1];
				rules[currentChain] = [];
				continue;
			}
			if (raw.startsWith('num'))
				continue;
			rules[currentChain].push(new RuleBean(raw));
		}
		return rules;
	}
	
	//添加规则  FIN
	addRuleByChainName(chainName, rule, append) {
		let isAppend = append 				? '-A' : '-I';
		let target = rule.target 			? ` -j ${rule.target}` : '';
		let prot = rule.prot 				? ` -p ${rule.prot}` : '';
		let in_int = rule.in_int 			? ` -i ${rule.in_int}` : '';
		let out_int = rule.out_int 			? ` -o ${rule.out_int}` : '';
		let source = rule.source 			? ` -s ${rule.source}` : '';
		let destination = rule.destination 	? ` -d ${rule.destination}` : '';
		let cmd = `iptables -t filter ${isAppend} ${chainName}${prot}${in_int}${out_int}${source}${destination}${target}`;
		execSync(cmd);
	}
	
	//删除规则  FIN
	delRuleByChainNameId(chainName, id) {
		let cmd = `iptables -t filter -D ${chainName} ${id}`;
		execSync(cmd);
	}
	
	//清空规则 FIN
	clearRuleByChainName(chainName) {
		//防止误删系统链
		if (chainName == this.sysInputTable
			|| chainName == this.sysForwardTable) {
			console.log(`不能清空${chainName}, 这是系统链!`);
			return;
		}
		let cmd = '';
		//清空链表内容
		cmd = `iptables -t filter -F ${chainName}`;
		execSync(cmd);
	}
	
	//创建链 FIN
	createChain(chainName) {
		//查询表是否存在
		let allRules = this.getAllRules();
		for (let name in allRules) {
			if (name == chainName) {
				console.log(`不能添加${chainName}, 链已存在!`);
				return false;
			}
		}
		
		let cmd = `iptables -t filter -N ${chainName}`;
		execSync(cmd);
		return true;
	}
	
	//删除链 FIN
	deleteChain(chainName) {
		//防止误删系统链
		if (chainName == this.sysInputTable
				|| chainName == this.sysForwardTable) {
			console.log(`不能删除${chainName}, 这是系统链!`);
			return;
		}
		let allRules = this.getAllRules();
		//判断链是否存在
		let chainExists = false;
		for (let name in allRules)
			if (name == chainName)
				chainExists = true;
		if (!chainExists) {
			console.log(`不能删除${chainName}, 链不存在!`);
			return;
		}
			
		//遍历全部链，先删除link
		for (let chain in allRules) {
			let rules = allRules[chain];
			//遍历全部规则, 从下到上分析，防止num号码变化
			for (let i = rules.length-1;i > -1 ;i--) {
				//判断是否与被删除链有关，是的话删除
				if (rules[i].target == chainName)
					this.delRuleByChainNameId(chain, i+1);
			}
		}
		let cmd = '';
		//清空链表内容
		cmd = `iptables -t filter -F ${chainName}`;
		execSync(cmd);
		//删除链表
		cmd = `iptables -t filter -X ${chainName}`;
		execSync(cmd);
	}
	
}
module.exports = Controller;
