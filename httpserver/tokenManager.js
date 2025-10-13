/**
 * package httpserver/tokenManager.js
 * 
 * 
 */
class TokenManager {
    constructor(userDAO, roleDAO) {
        this.userDAO = userDAO;
        this.roleDAO = roleDAO;
    }

    /**
     * 从数据库同步用户以及权限
     */
    async syncDatabase() {

    }

    getInfoByToken(token) {

    }

    createToken(user) {

    }

    destoryToken(token) {

    }
}
module.exports = TokenManager;