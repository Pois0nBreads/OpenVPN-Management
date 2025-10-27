-- OpenVPN Management System Database Initialization
-- 完整的数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS openvpn_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE openvpn_management;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `uid` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户唯一ID',
    `username` VARCHAR(255) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码(SHA256加密)',
    `nickname` VARCHAR(255) DEFAULT NULL COMMENT '昵称',
    `roles` VARCHAR(255) DEFAULT '' COMMENT '拥有的角色ID列表(逗号分隔)',
    `last_login` BIGINT DEFAULT NULL COMMENT '最后登录时间(时间戳)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_last_login (last_login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
    `uid` INT AUTO_INCREMENT PRIMARY KEY COMMENT '角色唯一ID',
    `role_name` VARCHAR(255) NOT NULL COMMENT '角色名称',
    `networks` VARCHAR(255) DEFAULT '' COMMENT '拥有的网络组ID列表(逗号分隔)',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '角色描述',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 网络组表
CREATE TABLE IF NOT EXISTS `network` (
    `uid` INT AUTO_INCREMENT PRIMARY KEY COMMENT '网络组唯一ID',
    `network_name` VARCHAR(255) NOT NULL COMMENT '网络组名称',
    `networks` VARCHAR(2000) DEFAULT '' COMMENT '网络段列表(逗号分隔的CIDR格式)',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '网络组描述',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_network_name (network_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网络组表';

-- 配置表 (固定只有一条记录)
CREATE TABLE IF NOT EXISTS `config` (
    `id` INT PRIMARY KEY DEFAULT 1 COMMENT '配置ID(固定为1)',
    `ca` TEXT COMMENT 'VPN CA证书',
    `cert` TEXT COMMENT 'VPN CERT证书',
    `key` TEXT COMMENT 'VPN KEY私钥',
    `dh` TEXT COMMENT 'VPN DH参数',
    `serverNet` VARCHAR(255) DEFAULT '10.8.0.0/24' COMMENT 'VPN虚拟网段',
    `serverPort` VARCHAR(10) DEFAULT '1194' COMMENT 'VPN服务端口',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 系统日志表 (可选，用于记录操作日志)
CREATE TABLE IF NOT EXISTS `system_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    `user_id` INT DEFAULT NULL COMMENT '操作用户ID',
    `username` VARCHAR(255) DEFAULT NULL COMMENT '操作用户名',
    `action` VARCHAR(100) NOT NULL COMMENT '操作类型',
    `description` TEXT COMMENT '操作描述',
    `ip_address` VARCHAR(45) DEFAULT NULL COMMENT '操作IP地址',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_user_id (user_id),
    INDEX idx_username (username),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统操作日志表';

-- 客户端连接日志表 (可选，用于记录VPN客户端连接信息)
CREATE TABLE IF NOT EXISTS `client_connection_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '连接记录ID',
    `client_id` VARCHAR(100) NOT NULL COMMENT '客户端ID',
    `common_name` VARCHAR(255) NOT NULL COMMENT '客户端证书名称',
    `virtual_address` VARCHAR(45) DEFAULT NULL COMMENT '虚拟IP地址',
    `real_address` VARCHAR(45) DEFAULT NULL COMMENT '真实IP地址',
    `connect_time` BIGINT NOT NULL COMMENT '连接时间(时间戳)',
    `disconnect_time` BIGINT DEFAULT NULL COMMENT '断开时间(时间戳)',
    `rx_bytes` BIGINT DEFAULT 0 COMMENT '接收字节数',
    `tx_bytes` BIGINT DEFAULT 0 COMMENT '发送字节数',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    INDEX idx_client_id (client_id),
    INDEX idx_common_name (common_name),
    INDEX idx_connect_time (connect_time),
    INDEX idx_real_address (real_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户端连接日志表';

-- 插入默认角色
INSERT IGNORE INTO `role` (`uid`, `role_name`, `networks`, `description`) VALUES
(1, '管理员', '1,2', '系统管理员，拥有所有权限'),
(2, '普通用户', '2', '普通用户，拥有基本网络访问权限');

-- 插入默认网络组
INSERT IGNORE INTO `network` (`uid`, `network_name`, `networks`, `description`) VALUES
(1, '管理网络', '192.168.0.0/16,10.0.0.0/8', '内部管理网络段'),
(2, '互联网访问', '0.0.0.0/0', '允许访问所有互联网资源');

-- 插入默认管理员用户 (密码: 88888888)
-- 注意：密码使用SHA256加密存储
INSERT IGNORE INTO `user` (`uid`, `username`, `password`, `nickname`, `roles`) VALUES
(1, 'Administrator', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', '系统管理员', '1');

-- 插入默认配置
INSERT IGNORE INTO `config` (`id`, `ca`, `cert`, `key`, `dh`, `serverNet`, `serverPort`) VALUES
(1, NULL, NULL, NULL, NULL, '10.8.0.0/24', '1194');

-- 插入示例普通用户 (密码: 123456)
INSERT IGNORE INTO `user` (`uid`, `username`, `password`, `nickname`, `roles`) VALUES
(2, 'user1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '示例用户1', '2'),
(3, 'user2', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '示例用户2', '2');

-- 显示初始化结果
SELECT '数据库初始化完成!' AS '状态';
SELECT '角色表数据:' AS '检查结果';
SELECT * FROM `role`;

SELECT '网络组表数据:' AS '检查结果';
SELECT * FROM `network`;

SELECT '用户表数据:' AS '检查结果';
SELECT uid, username, nickname, roles FROM `user`;

SELECT '配置表数据:' AS '检查结果';
SELECT * FROM `config`;