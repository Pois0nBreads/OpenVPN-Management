/**
 * package httpserver/tokenManager.js
 */
const UUID = require('uuid');

class TokenManager {
    constructor(userDAO) {
        this.expiredTime = 15 * 60 * 1000;
        this.tokenMap = {}; // K:token V:{name, expiredTime}
        this.userMap = {}; // K:name V:DBitem
        this.userDAO = userDAO;
        this.syncDatabase();
        setTimeout(this.cleanExpiredToken, 10000);
    }

    /**
     * 定时删除过期Token
     */
    cleanExpiredToken() {
        let now = new Date().getTime();
        for (let token in this.tokenMap) {
            let expiredTime = this.tokenMap[token].expiredTime;
            if (now > expiredTime)
                delete this.tokenMap[token];
        }
    }

    /**
     * 从数据库同步用户以及权限
     */
    async syncDatabase() {
        let userList = await this.userDAO.getAllUsers();
        let tempUserMap = {};
        for (let user of userList){
            tempUserMap[user.username] = user;
        }
        this.userMap = tempUserMap;
        for (let token in this.tokenMap) {
            try {
                let name = this.tokenMap[token].name;
                if (!this.userMap[name])
                    delete this.tokenMap[token]
            } catch(e) {}
        }
    }

    /**
     * 获取Token信息 mtoken不存在返回null
     */
    getInfoByToken(token) {
        let result = {level:0, user:""};
        let item = this.tokenMap[token];
        if (item) {
            item.expiredTime = new Date().getTime() + this.expiredTime;
            let name = item.name;
            result.user = name;
            result.level = (name === 'Administrator' ? 2 : 1);
        }
        return result;
    }
    
    /**
     * 创建token
     */
    createToken(name) {
        let user = this.userMap[name];
        if (!user)
            return null;
        let token = UUID.v4();
        this.tokenMap[token] = {name: name, expiredTime: new Date().getTime() + this.expiredTime};
        return token;
    }

    /**
     * 销毁token
     */
    destoryToken(token) {
        if (this.tokenMap[token])
            delete this.tokenMap[token];
    }

    /**
     * 查询全部Token 返回 [{token:.. , name:.. , expiredTime: ..}....]
     */
    queryAllToken() {
        let result = []
        for (let token in this.tokenMap) {
            let item = {
                token: token,
                name: this.tokenMap[token].name,
                expiredTime: this.tokenMap[token].expiredTime
            }
            result.push(item);
        }
        return result;
    }


}
module.exports = TokenManager;