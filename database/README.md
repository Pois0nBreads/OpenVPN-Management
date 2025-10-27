# OpenVPN Management System Database

## 数据库初始化说明

### 文件说明

- `schema.sql` - 数据库表结构定义
- `seed.sql` - 初始数据插入脚本
- `init.sql` - 完整的数据库初始化脚本（包含表结构和初始数据）
- `init-db.js` - Node.js数据库初始化脚本

### 初始化方法

#### 方法1：手动执行SQL文件

```bash
# 执行完整的初始化脚本
mysql -u ovpn -p < database/init.sql

# 或者分别执行
mysql -u ovpn -p < database/schema.sql
mysql -u ovpn -p < database/seed.sql
```

#### 方法2：使用Node.js脚本

```javascript
const DatabaseInitializer = require('./database/init-db');
const config = require('../config.js');

const initializer = new DatabaseInitializer(config.dataBase);

// 完整初始化
await initializer.initialize();

// 仅插入种子数据
await initializer.seedData();
```

### 初始数据

#### 默认用户

- **管理员用户**
  - 用户名: `Administrator`
  - 密码: `88888888`
  - 角色: 管理员

- **示例普通用户**
  - 用户名: `user1`, `user2`
  - 密码: `123456`
  - 角色: 普通用户

#### 默认角色

1. **管理员** - 拥有所有网络访问权限
2. **普通用户** - 仅拥有互联网访问权限

#### 默认网络组

1. **管理网络** - 内部管理网络段 (192.168.0.0/16, 10.0.0.0/8)
2. **互联网访问** - 允许访问所有互联网资源 (0.0.0.0/0)

#### 默认配置

- VPN虚拟网段: `10.8.0.0/24`
- VPN服务端口: `1194`

### 密码加密

所有密码都使用SHA256加密存储：
- `88888888` → `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`
- `123456` → `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92`

### 注意事项

1. 脚本使用 `INSERT IGNORE` 语句，避免重复插入数据
2. 确保数据库用户 `ovpn` 有足够的权限创建数据库和表
3. 初始化脚本会自动创建数据库 `openvpn_management`
4. 字符集使用 `utf8mb4` 以支持完整的Unicode字符

### 验证初始化结果

执行初始化后，可以运行以下SQL验证数据：

```sql
USE openvpn_management;

-- 查看用户
SELECT uid, username, nickname, roles FROM user;

-- 查看角色
SELECT * FROM role;

-- 查看网络组
SELECT * FROM network;

-- 查看配置
SELECT * FROM config;
```