/**
 * package dao/networkDAO.js
 * Struct Network {
 *      int id,                     //固定为1
 *      varchar(255) ca,            //VPN CA
 *      varchar(255) cert,          //VPN CERT
 *      varchar(255) key,           //VPN KEY
 *      varchar(255) dh,            //VPN DH
 *      varchar(255) serverNet,     //VPN Net
 *      varchar(255) serverPort,     //VPN Port
 * }
 * 
 */

const { Network } = require('inspector');
const mysql = require('mysql');
const util = require('util');
const Netmask = require('netmask').Netmask;

const CONFIG_TABLE_NAME = "config";

class ConfigDAO {
    constructor(options) {
        this.pool = mysql.createPool({
            host: options.host,
            port: options.port,
            user: options.user,
            password: options.password,
            database: options.database,
            connectionLimit: 10,
            acquireTimeout: 10000
        });
        
        // 将 pool.query 转换为 Promise 版本
        this.pool.query = util.promisify(this.pool.query);
    }

    /**
     * 获取全部配置
     * @returns {Promise<Array>} 
     */
    async getAllConfig() {
        try {
            const sql = `SELECT * FROM ${CONFIG_TABLE_NAME} where id = 1`;
            return (await this.pool.query(sql))[0];
        } catch (err) {
            throw err;
        }
    }
    
    /**
     * 更新全部配置
     * @returns {Promise<Array>} 
     */
    async setAllConfig(config) {
        try {
            if (!this.isValidCIDRnet(config.server_net))
                throw new Error('server_net网段格式无效');
            let net = new Netmask(config.server_net);
            if (net.bitmask < 16 || net.bitmask > 24)
                throw new Error('server_net网段掩码应该 大于16 小于24');
            config.server_port = parseInt(config.server_port);
            if (config.server_port < 1 || config.server_port > 65535)
                throw new Error('server_port端口超出范围');
            const sql = `UPDATE ${CONFIG_TABLE_NAME} set ca = ? , cert = ? , \`key\` = ? , dh = ? , serverNet = ? , serverPort = ? where id = 1`;
            const result = await this.pool.query(sql, [config.ca, config.cert, config.key, config.dh, config.server_net, config.server_port]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 检查IP是否符合cidr
     * @param {string} cidr CIDR表示法
     * @returns {boolean} 是否有效
     */
    isValidCIDRnet(cidr) {
        try {
            let net = new Netmask(cidr);
            let ip = cidr.split('/');
            if (ip.length != 2)
                return false;
            return ip[0] === net.base && ip[1] != null;
        } catch(e) {
            return false;
        }
    }

}

module.exports = ConfigDAO;