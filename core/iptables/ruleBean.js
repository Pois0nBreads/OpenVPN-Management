/**
*	package core/iptables/ruleBean.js
**/
class RuleBean {
	constructor(options){
		this.num = null;
		this.pkts = null;
		this.bytes = null;
		this.target = null;
		this.prot = null;
		this.opt = null;
		this.in_int = null;
		this.out_int = null;
		this.source = null;
		this.destination = null;
		if (typeof(options) == 'string')
			this.fromString(options);
		if (typeof(options) == 'object')
			Object.assign(this, options);
	}
	
	fromString(raw) {
		let raw_array = [];
		for (let raw_split of raw.split(' ').filter(Boolean))
			raw_array.push(raw_split);
		this.num 			= raw_array[0];
		this.pkts 			= raw_array[1];
		this.bytes 			= raw_array[2];
		this.target 		= raw_array[3];
		this.prot 			= raw_array[4];
		this.opt 			= raw_array[5];
		this.in_int 		= raw_array[6];
		this.out_int 		= raw_array[7];
		this.source 		= raw_array[8];
		this.destination 	= raw_array[9];
		return this;
	}
	
	toString() {
		return  `num: ${this.num} pkts: ${this.pkts} bytes: ${this.bytes} target: ${this.target}` + 
				` prot: ${this.prot} opt: ${this.opt} in_int: ${this.in_int} out_int: ${this.out_int}` + 
				` source: ${this.source} destination: ${this.destination}`;
	}
}
module.exports = RuleBean;