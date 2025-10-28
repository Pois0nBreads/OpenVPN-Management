/**
 * package dao/networkDAO.js
 * Struct Network {
 *      int uid,                    //网络组唯一ID
 *      varchar(255) network_name,  //网络组名称
 *      varchar(255) networks,      //网络组集合
 * }
 * 
 */
const { Network } = require('inspector');
const mysql = require('mysql');
const util = require('util');
const Netmask = require('netmask').Netmask;

const NETWORK_TABLE_NAME = "network";

class NetworkDAO {
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
     * 获取全部网络组
     * @returns {Promise<Array>} 网络组列表
     */
    async getAllNetworks() {
        try {
            const sql = `SELECT * FROM ${NETWORK_TABLE_NAME}`;
            const data = await this.pool.query(sql);
            
            // 处理 networks 字段
            for (let i = 0; i < data.length; i++) {
                data[i].networks = data[i].networks.split(',').filter(Boolean);
            }
            
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据网络组ID获取信息
     * @param {number} uid 网络组UID
     * @returns {Promise<Object|null>} 网络组信息或null
     */
    async getNetworkByUID(uid) {
        try {
            const sql = `SELECT * FROM ${NETWORK_TABLE_NAME} WHERE uid = ?`;
            const result = await this.pool.query(sql, [uid]);
            
            if (result.length === 0) {
                return null;
            }
            
            const data = result[0];
            data.networks = data.networks.split(',').filter(Boolean);
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据网络组名称获取信息
     * @param {string} networkName 网络组名称
     * @returns {Promise<Object|null>} 网络组信息或null
     */
    async getNetworkByName(networkName) {
        try {
            const sql = `SELECT * FROM ${NETWORK_TABLE_NAME} WHERE network_name = ?`;
            const result = await this.pool.query(sql, [networkName]);
            
            if (result.length === 0) {
                return null;
            }
            
            const data = result[0];
            data.networks = data.networks.split(',').filter(Boolean);
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 创建网络组
     * @param {string} networkName 网络组名
     * @param {Array} networks 网络组数组
     * @returns {Promise<Object>} 插入结果
     */
    async addNetwork(networkName, networks) {
        try {
            // 检查网络组名称是否已存在
            const existingNetwork = await this.getNetworkByName(networkName);
            if (existingNetwork) {
                throw new Error("Failed to add network. Network name already exists!");
            }
            let cidrs = [];
            for (let network of networks)
                cidrs.push(new Netmask(network).toString());
            const networkstr = cidrs.join(',');
            const sql = `INSERT INTO ${NETWORK_TABLE_NAME} (network_name, networks) VALUES (?, ?)`;
            const result = await this.pool.query(sql, [networkName, networkstr]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据网络组UID删除
     * @param {number} uid 网络组UID
     * @returns {Promise<Object>} 删除结果
     */
    async delNetworkByUId(uid) {
        try {
            const existingNetwork = await this.getNetworkByUID(uid);
            
            if (!existingNetwork) {
                throw new Error("Failed to delete network. Network does not exist!");
            }
            
            const sql = `DELETE FROM ${NETWORK_TABLE_NAME} WHERE uid = ?`;
            const result = await this.pool.query(sql, [uid]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据UID修改网络组名称
     * @param {number} uid 网络组UID
     * @param {string} networkName 新网络组名
     * @returns {Promise<Object>} 更新结果
     */
    async changeNetworkNameByUID(uid, networkName) {
        try {
            const existingNetwork = await this.getNetworkByUID(uid);
            
            if (!existingNetwork) {
                throw new Error("Failed to modify network. Network does not exist!");
            }
            
            // 检查新名称是否已被其他网络组使用
            const networkWithSameName = await this.getNetworkByName(networkName);
            if (networkWithSameName && networkWithSameName.uid !== uid) {
                throw new Error("Failed to modify network. Network name already exists!");
            }
            
            const sql = `UPDATE ${NETWORK_TABLE_NAME} SET network_name = ? WHERE uid = ?`;
            const result = await this.pool.query(sql, [networkName, uid]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 根据UID修改所拥有网络组
     * @param {number} uid 网络组UID
     * @param {Array} networks 网络组数组
     * @returns {Promise<Object>} 更新结果
     */
    async changeNetworkByUID(uid, networks) {
        try {
            const existingNetwork = await this.getNetworkByUID(uid);
            
            if (!existingNetwork) {
                throw new Error("Failed to modify network. Network does not exist!");
            }
            let cidrs = [];
            for (let network of networks)
                cidrs.push(new Netmask(network).toString());
            const networkstr = cidrs.join(',');
            const sql = `UPDATE ${NETWORK_TABLE_NAME} SET networks = ? WHERE uid = ?`;
            const result = await this.pool.query(sql, [networkstr, uid]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 检查网络组是否存在
     * @param {number} uid 网络组UID
     * @returns {Promise<boolean>} 是否存在
     */
    async networkExists(uid) {
        try {
            const network = await this.getNetworkByUID(uid);
            return network !== null;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 验证IP地址是否在某个网络组中
     * @param {string} ip IP地址
     * @param {number} networkUid 网络组UID
     * @returns {Promise<boolean>} 是否在组中
     */
    async isIPInNetwork(ip, networkUid) {
        try {
            const network = await this.getNetworkByUID(networkUid);
            if (!network) {
                return false;
            }
            
            // 这里可以添加IP地址验证逻辑
            // 简单示例：检查IP是否在networks数组中
            return network.networks.some(net => {
                // 这里可以实现CIDR或IP范围验证
                return net === ip || this.isIPInCIDR(ip, net);
            });
        } catch (err) {
            throw err;
        }
    }

    /**
     * 检查IP是否在CIDR范围内
     * @param {string} ip IP地址
     * @param {string} cidr CIDR表示法
     * @returns {boolean} 是否在范围内
     */
    isIPInCIDR(ip, cidr) {
        const block = new Netmask(cidr);
        return block.contains(ip)
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

    cidrToRange(cidr) {
        let range = new Netmask(cidr);
        return {
            ip: range.base,
            mask: range.mask,
            toString: () => `${range.base} ${range.mask}`
        };
    }
}

module.exports = NetworkDAO;