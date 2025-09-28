/**
*	package core/openvpn/clientBean.js
**/

class ClientBean {
	constructor(options){
		this.commonName = null;
		this.realAddress = null;
		this.virtualAddress = null;
		this.virtualAddressV6 = null;
		this.rxBytes = null;
		this.txBytes = null;
		this.connectTime = null;
		this.connectTime_t = null;
		this.userName = null;
		this.clientID = null;
		this.peerID = null;
		if (typeof(options) == 'string')
			this.fromString(options);
		if (typeof(options) == 'object')
			if (Array.isArray(options))
				this.fromArray(options);
			else
				Object.assign(this, options);
	}
	
	fromString(raw) {
		let raw_array = [];
		for (let raw_split of raw.split(',').filter(Boolean))
			raw_array.push(raw_split);
		this.fromArray(raw_array);
		return this;
	}
	
	fromArray(raw_array) {
		this.commonName 		= raw_array[1];
		this.realAddress 		= raw_array[2];
		this.virtualAddress 	= raw_array[3];
		this.virtualAddressV6 	= raw_array[4];
		this.rxBytes 			= raw_array[5];
		this.txBytes 			= raw_array[6];
		this.connectTime 		= raw_array[7];
		this.connectTime_t 		= raw_array[8];
		this.userName 			= raw_array[9];
		this.clientID 			= raw_array[10];
		this.peerID 			= raw_array[11];
		return this;
	}
	
	toString() {
		return  `commonName: ${this.commonName} realAddress: ${this.realAddress}` +
				` virtualAddress: ${this.virtualAddress} virtualAddressV6: ${this.virtualAddressV6}` + 
				` rxBytes: ${this.rxBytes} txBytes: ${this.txBytes} connectTime: ${this.connectTime}` +
				` connectTime_t: ${this.connectTime_t} userName: ${this.userName}` + 
				` clientID: ${this.clientID} peerID: ${this.peerID}`;
	}
}

module.exports = ClientBean;