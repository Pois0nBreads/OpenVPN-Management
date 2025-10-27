/**
*	package core/openvpn/config.js
**/

let ca = `-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgIJAMuQjXawTVTEMA0GCSqGSIb3DQEBCwUAMDcxCzAJBgNV
BAYTAkNOMQ4wDAYDVQQKDAVpS3VhaTEYMBYGA1UEAwwPaUt1YWkgRGV2aWNlIENB
MB4XDTE4MDkyMDA5Mzc1NVoXDTI4MDkxNzA5Mzc1NVowNzELMAkGA1UEBhMCQ04x
DjAMBgNVBAoMBWlLdWFpMRgwFgYDVQQDDA9pS3VhaSBEZXZpY2UgQ0EwggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCtQhxqHylcGgT370MbqspQAOSo4ppV
q10gHZ8qJzp1L/209aImt9QQ7QUGDyoR4BTAtuVEuWHlBTAnBuHmTi3Z/xuzA/mX
qjsnXci/ShI/fM0Q9kccLRp/yPmGwkI/fXSMWK+q+dAawu9NdOwwZgqtW4gcCSKA
6Z7GU46wTMpn2GTZzxE+frKsR7HsFfnGuLqBlTYJAZ2jymGe4j/HpdPMr4BRykif
ZeCjSN+Hf5lbBHU3NPDkfy3oC1lJ7oTYO3JMfFlQy3pOhvWtVVorzQeCdCzTyj2R
K2Zvarb0ajAoCHfpIHpQWBuNBcWHuT3vyXPGOrsZYbQN9nNvjrGJZt+7AgMBAAGj
UDBOMB0GA1UdDgQWBBQ8o4Kiab76OgNeAUwBBFRTd2nfHTAfBgNVHSMEGDAWgBQ8
o4Kiab76OgNeAUwBBFRTd2nfHTAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUA
A4IBAQALiaJ/L20bITQugptz0ghTSAENxI5aBLdOE3MZO9RfFOaXcXGNFUDpRcKf
wCRRqVo0VvGSE9mtSvb2Cr/YhitmZGyFl7GvMpRK25EzBvXuc3dz4PezJGVuDebf
x55C30qmV0UOXAlYDUC7DSpztQyB2EGLJ0WKK/cAHjDU+CDXVPjho6eOP0A0JDuf
gppYSB2vhecuL6igxRjIATKDBoBMw6J6xfzpVbVIl2QZovuYM/1DYOS6ERsPlmrv
RPPBSdz4U7RYULz1kI/tfv8vYsdHhCGYcjnfrZwVIiY/SyIi0qxx4sMvzmmRR1TL
BHROdblVAIgHb9gnrmeycFDK/+p6
-----END CERTIFICATE-----
`;
let cert = `-----BEGIN CERTIFICATE-----
MIIC6jCCAdICBFujanMwDQYJKoZIhvcNAQELBQAwNzELMAkGA1UEBhMCQ04xDjAM
BgNVBAoMBWlLdWFpMRgwFgYDVQQDDA9pS3VhaSBEZXZpY2UgQ0EwHhcNMTgwOTIw
MDkzNzU1WhcNMjgwOTE3MDkzNzU1WjA8MQswCQYDVQQGEwJDTjEOMAwGA1UECgwF
aUt1YWkxHTAbBgNVBAMMFGlLdWFpIE9wZW5WUE4gU2VydmVyMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEArUIcah8pXBoE9+9DG6rKUADkqOKaVatdIB2f
Kic6dS/9tPWiJrfUEO0FBg8qEeAUwLblRLlh5QUwJwbh5k4t2f8bswP5l6o7J13I
v0oSP3zNEPZHHC0af8j5hsJCP310jFivqvnQGsLvTXTsMGYKrVuIHAkigOmexlOO
sEzKZ9hk2c8RPn6yrEex7BX5xri6gZU2CQGdo8phnuI/x6XTzK+AUcpIn2Xgo0jf
h3+ZWwR1NzTw5H8t6AtZSe6E2DtyTHxZUMt6Tob1rVVaK80HgnQs08o9kStmb2q2
9GowKAh36SB6UFgbjQXFh7k978lzxjq7GWG0DfZzb46xiWbfuwIDAQABMA0GCSqG
SIb3DQEBCwUAA4IBAQCSnBZ45Dr7IQBccRxbhMIreKWshC8772k09H/0aonVe/zh
IR6X/MeQ6wkmImE5CONn9nB+yE3vdEt6cfvHepLKKhP1k0ry3u3v5UZF5LIC4gjn
V9eROgNK+ho88nrIJN7gadDaK9u1eWuuXrEGvZc5nm3EZKLgovwa20hF5oWzM45G
mBFTzJuS4LoYHNpVD+270RUpLcMGt0AKWodej2sF2pfwB1tXSAXqBTBoBJgG5cUx
LIyetC/LxAnmK72MU69fK0D/0JfKN+W/JMev2ZA30G3I6QU3HtSc2KbuT0RNL0XZ
b9DPf4iiextDsjxF6rUtZDfgWvtYiI+xvc0yulNF
-----END CERTIFICATE-----
`;

let key = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEArUIcah8pXBoE9+9DG6rKUADkqOKaVatdIB2fKic6dS/9tPWi
JrfUEO0FBg8qEeAUwLblRLlh5QUwJwbh5k4t2f8bswP5l6o7J13Iv0oSP3zNEPZH
HC0af8j5hsJCP310jFivqvnQGsLvTXTsMGYKrVuIHAkigOmexlOOsEzKZ9hk2c8R
Pn6yrEex7BX5xri6gZU2CQGdo8phnuI/x6XTzK+AUcpIn2Xgo0jfh3+ZWwR1NzTw
5H8t6AtZSe6E2DtyTHxZUMt6Tob1rVVaK80HgnQs08o9kStmb2q29GowKAh36SB6
UFgbjQXFh7k978lzxjq7GWG0DfZzb46xiWbfuwIDAQABAoIBAFpZn3e3yFm/N9gT
bWuAJQCTdqqbgOAr/ORCjj3tNw7ld+hmL6kBNBWfhH8kaUvpDulwdx7fja1ghzvS
2vq+yipkXo18BSySGUbuIUGf3uQ8sLOnum13F9qLc5RSuTlisuR9Wx5OJ7fM7/30
ezbB/89nbBMysEuJiMLj0AUgBm0gD5lAWLG9xLamlhSzkUb9uh1S3jIGlyxK3KNu
Hk3sOCSDHO8CmTj+fbzad3rRNZOViPms3Lk6yNrybhe0nrPSMUz7YjQPcveHhsaC
Uu/l624BJ+MoNM9eEnNqdYoccJ057IQXhhoOxG/abSyzyNdUgpyalGNQOZyzFH0b
8vppvAECgYEA3B+0mqhFoSE+Er4FXWzj4p3GoZnMG9J9QjBMVqdANAlqQ7/hyPq4
0dclindogc0iFCwdZNA65mPVjzWG0o2Mbsx/3oS96HYUJzIR4IK+GMv4dZT4F1+G
BRzK/D8n68HSuogVWwVAWpJ/1g4HVZCPrMhxfkD9THmCdowVCsSVTncCgYEAyX8E
hB0+5JDyCSmtkdhH5CbTaEr6eM6mOXPHRqOsh6rbRziA4umINp9fWEJcuNYwyXBS
WH959OWQVBI6OajCZBr6NWhx85dKjLLOT5OJ7wsA00IOX8j+xlhmX7UfyjMTJmH4
1CKqs5DS5sryOcluy+WY7j1FgZxEo1vr3jY4td0CgYA8NnQJxjPdwqEfMVl4V9vy
VmRKOi7KAYb//wQyw+ddFKI7zBYwCt1ZkTeUq9srfnhu+i5EMG2cLfzyAptRpySd
/lSQAtGL8BjNK/YV6s2jLNBXIZvHkPqxFVI1M/VwmQFSwvzMfCBBZkePvyCkeDnE
8sOQ3KgtLiPQ17q9yk5pOwKBgHGPrLPo57FaH48adkBkbOAhIbT9zPyZOwXWQtGF
HY+4s60II1u/0o02dT4A6NEjpothSoemEM39M8KuIzKr8iMJMUs4ekCXW+TAQZaH
yI143hYyfHdviGexGsGGC0yiTICtZtfoUdyyGqsIZkw7Qr6XwAFFdw79S5HmFKFA
XeXhAoGAf/WxpWAjIDEd1Jsxgw6I0IgYeecB+AaikJCthrAp9JvSOA4AXelfzUsl
D3i5QmhvK/iO7IIZZsdTJKKZezT3zMVaTBzT4P13TBl4ReMWZk9vKZeH0+CGQTmd
iQPLfs7Cvl9tQkVp6W+wMdTKkdAHtJzeK13VYIXNPYn/Vix1khM=
-----END RSA PRIVATE KEY-----
`;
let dh = `
-----BEGIN DH PARAMETERS-----
MIIBCAKCAQEAqjUeGPRQljYbM3UXM2S3EvhOGRJPBR9tvl8mmZd16Wyg/jgB+yrv
68+D8GAC/xJDoGQYD4UI4TQybXuGFTwFeFQAFPeiVfCX4fdW/MenlZDZ5Ok0LPGu
hepmTTOM8CI0YVwPKp2/AZ+xsE3opBOrU/8dPL2lMNdtwgPa2K2NyM8mf2HIjpeG
9pV8rZSp2mIQTmZNGNpgoPw+y7raxnYuok9RvLDk3g+3YGq10RqyRCoVmBVp/pnW
RF03VvglO5fJpm4s9Url35BQEy/etgo7o17ss36H9redlKiJJQOMTsM2ao0eMfhk
HG/2onwpiSKtWQdMQ/1Ygk6YA5dEqkv+qwIBAg==
-----END DH PARAMETERS-----
`;

class OpenVPNConfig {
	
	constructor(options) {
		this.run_path		= global.run_path;
		this.ssl_path		= this.run_path + 'ssl/';
		this.ca				= ca;
		this.cert			= cert;
		this.key			= key;
		this.dh				= dh;
		this.verif_script	= this.run_path + 'core/openvpn/passwd.py';
		this.iplearn_script	= this.run_path + 'core/openvpn/iplearn.py';
		this.dynamic_route_script	= this.run_path + 'core/openvpn/dynamic-route.py';
		this.local			= "0.0.0.0";			//本地监听地址
		this.port			= "1194";				//本地监听端口
		this.dev			= "tun0";				//本地服务设备
		this.proto			= "tcp";				//协议类型
		this.server_net		= "192.168.110.0";		//VPN虚拟网段
		this.server_mask	= "255.255.255.0";		//VPN虚拟掩码
		this.chiper			= "AES-256-CBC";		//VPN加密协议
		this.http_server_ip	= "127.0.0.1";			//VPN加密协议
		this.http_server_port = "8080";				//VPN加密协议
		
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
				`--client-connect ${this.dynamic_route_script} ` +
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
				`--port-share`, `${this.http_server_ip}`, `${this.http_server_port}`,
				`--topology`, `subnet`,
				`--verify-client-cert`, `none`,
				`--username-as-common-name`,
				`--auth-user-pass-verify`, `${this.verif_script}`, `via-env`,
				`--learn-address`, `${this.iplearn_script}`,
				`--client-connect`, `${this.dynamic_route_script}`,
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
				//`--ca`, `${this.ssl_path}ca`,
				`--ca`, ca,
				`--cert`, `${this.ssl_path}cert`,
				`--key`, `${this.ssl_path}key`,
				`--dh`, `${this.ssl_path}dh`
			];
		return params;
	}
	//生成启动参数列表
	getStartFile() {
		return `
mode server
local ${this.local}
port ${this.port}
dev ${this.dev}
proto ${this.proto}
port-share ${this.http_server_ip} ${this.http_server_port}
topology subnet
verify-client-cert none
username-as-common-name
auth-user-pass-verify ${this.verif_script} via-env
learn-address ${this.iplearn_script}
client-connect ${this.dynamic_route_script}
script-security 3
server ${this.server_net} ${this.server_mask}
client-to-client
duplicate-cn
cipher ${this.chiper}
keepalive 10 180
persist-key
persist-tun
management /tmp/openvpn.management.sock unix
verb 4
<ca>
${this.ca}
</ca>
<cert>
${this.cert}
</cert>
<key>
${this.key}
</key>
<dh>
${this.dh}
</dh>`;
	}
	
}
module.exports = OpenVPNConfig;
