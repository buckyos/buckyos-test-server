# BuckyOS 状态中心 API 与 Schema 定稿

## 1. 文档目的

本文档只保留当前已经确认有效的状态中心设计，用于后续直接对照 `/root/work/buckyos-test-server` 做代码修改。

本文档不再保留历史讨论分支、备选方案或已否定前提。

## 2. 当前定位

状态中心是一个单点、低频写入、发放式权限管理的轻量 HTTP 服务。

它的职责很简单：

- 记录某个 `product + version + os + arch` 对应的构建结果定位符
- 记录该版本的打包状态
- 记录该版本的安装包测试状态
- 记录该版本的发布状态
- 提供“未打包”和“未测试”版本的查询能力

状态中心不负责：

- 打包任务分配
- 测试任务分配
- 防重放
- log 保存
- repo / workflow 元数据管理
- 多 `component` 齐套判断

## 3. 设计边界

### 3.1 权限模型

当前权限模型已经定稿为：

- 权限是发放式，不是申请式
- 可写用户完全由系统管理员分配
- `users` 表允许直接保存私钥
- 服务端通过私钥推导公钥并验签
- 不要求请求时间戳
- 不要求 nonce

补充说明：

- 攻击状态中心写入本身没有实际收益
- 构建和测试结果上报都来自掌握在己方手中的机器

### 3.2 数据模型边界

当前状态中心首阶段只采用单表业务模型：

- `users`
- `versions`

其中：

- `versions` 以 `product + version + os + arch` 为主键
- 一条记录代表一个版本级构建结果及其后续状态
- 当前不拆分 `build_records`、`package_jobs`、`test_runs`

### 3.3 多表升级条件

只有在明确出现以下需求时，才考虑从 `versions` 单表升级为多表：

- 状态中心需要负责同一版本下多个输入 `component` 的齐套判断
- 同一版本需要保留多轮测试结果
- 同一版本需要保留多轮打包或测试重试历史
- 需要单独保存日志、测试机或更细的审计关系

在这些需求出现之前，`versions` 单表就是正式方案。

## 4. Schema 定稿

### 4.1 `users`

用途：

- 保存可调用 POST 接口的用户名、私钥和权限范围

字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `username` | `TEXT` | 用户名，主键 |
| `private_key` | `TEXT` | 十六进制私钥 |
| `scopes` | `TEXT` | JSON 数组字符串，表示允许操作的 `product` 列表 |

约束：

- 主键：`username`

当前不要求增加：

- `created_at`
- `updated_at`

### 4.2 `versions`

用途：

- 保存某个 `product + version + os + arch` 的构建结果定位符和状态位

字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `product` | `TEXT` | 产品名 |
| `version` | `TEXT` | 版本号 |
| `os` | `TEXT` | 目标系统 |
| `arch` | `TEXT` | 目标架构 |
| `tested` | `INTEGER` | 构建测试状态位；当前保留，但不是首阶段主关注字段 |
| `published` | `INTEGER` | 发布状态位 |
| `packed` | `INTEGER` | 打包状态位 |
| `pack_tested` | `INTEGER` | 安装包测试状态位 |
| `url` | `TEXT` | 构建结果定位符 |
| `commit_sha` | `TEXT` | 关联 commit |

约束：

- 主键：`product, version, os, arch`

说明：

- `url` 不要求一定是真实 URL
- `url` 只需要能被后续打包或测试脚本识别并消费
- 当前不要求把 `url` 收敛成 `rootfs` 专用字段
- 当前不要求新增 repo / workflow / log 相关字段

## 5. 覆盖规则定稿

当同一条主键记录再次写入时：

- 允许覆盖整行
- 新记录代表该 `product + version + os + arch` 下当前保留的最新有效结果

业务依据：

- 版本号原则上采用 `0.4.1+buildyymmdd` 一类形式
- 正常情况下，一天只保留一个版本
- 特殊情况下同一天可能构建多次
- 此时只保留当天最新的一个

因此，`POST /version/url` 覆盖同一主键记录时，必须显式执行以下规则：

- 更新 `url`
- 更新 `commit_sha`
- 所有状态位字段重置为 `0`

这里的“所有状态位字段”指：

- `tested`
- `published`
- `packed`
- `pack_tested`

## 6. 状态码定稿

状态库存储采用整数值。

基础语义固定为：

- `0`：该阶段尚未执行
- `1`：该阶段执行成功
- `-1`：该阶段执行失败

如果要表达中间态，则继续使用额外的一位整数状态码。

### 6.1 `packed`

| 值 | 含义 |
| --- | --- |
| `0` | 尚未打包 |
| `2` | 正在打包 |
| `1` | 打包成功 |
| `-1` | 打包失败 |

### 6.2 `pack_tested`

| 值 | 含义 |
| --- | --- |
| `0` | 尚未测试 |
| `2` | 正在测试 |
| `1` | 测试成功 |
| `-1` | 测试失败 |

### 6.3 `published`

| 值 | 含义 |
| --- | --- |
| `0` | 未发布 |
| `1` | 发布成功 |
| `-1` | 发布失败 |

### 6.4 `tested`

当前保留 `tested` 字段，但首阶段状态中心的主要查询和脚本闭环不依赖它。

如继续使用，其编码规则保持：

- `0`：未执行
- `1`：成功
- `-1`：失败

## 7. HTTP 接口定稿

HTTP 层继续沿用当前接口风格，不引入 `v1` 路由。

所有 POST 请求统一结构：

```json
{
  "content": {},
  "username": "caller",
  "signature": "hex-signature"
}
```

签名规则：

1. 对 `JSON.stringify(content)` 做 `sha256`
2. 使用 `users.private_key` 推导公钥
3. 用 `secp256k1` 验签

### 7.1 POST `/version/url`

用途：

- 上报一个 `product + version + os + arch` 对应的构建结果定位符

请求 `content`：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "url": "build://buckyos/0.5.1+build260312/windows/amd64",
  "commit": "abc123"
}
```

处理规则：

- 若主键不存在，则插入
- 若主键已存在，则覆盖原记录
- 覆盖时所有状态位重置为 `0`

### 7.2 POST `/version/pack`

用途：

- 更新打包状态

请求 `content` 可以是以下两类之一：

进入打包中：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "packing": true
}
```

回写打包结果：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "packed": true
}
```

或：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "packed": false
}
```

状态映射：

- `packing: true` -> `packed = 2`
- `packed: true` -> `packed = 1`
- `packed: false` -> `packed = -1`

约束：

- `packing` 与 `packed` 不能同时出现

### 7.3 POST `/version/test`

用途：

- 更新安装包测试状态

请求 `content` 可以是以下两类之一：

进入测试中：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "testing": true
}
```

回写测试结果：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "tested": true
}
```

或：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "tested": false
}
```

状态映射：

- `testing: true` -> `pack_tested = 2`
- `tested: true` -> `pack_tested = 1`
- `tested: false` -> `pack_tested = -1`

约束：

- `testing` 与 `tested` 不能同时出现

说明：

- 当前 `/version/test` 直接服务于安装包测试状态
- 不再区分单独的 `/version/packtest`

### 7.4 POST `/version/publish`

用途：

- 更新发布状态

请求 `content`：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "published": true
}
```

或：

```json
{
  "product": "buckyos",
  "version": "0.5.1+build260312",
  "os": "windows",
  "arch": "amd64",
  "published": false
}
```

状态映射：

- `published: true` -> `published = 1`
- `published: false` -> `published = -1`

### 7.5 GET `/version`

用途：

- 查询版本记录

当前保留以下查询参数：

- `page`
- `size`
- `product`
- `version`
- `os`
- `arch`
- `commit`
- `notest`
- `nopub`
- `nopack`

当前脚本只依赖：

- `nopack=true` 查未打包版本
- `notest=true` 查未测试版本

这两个查询方向当前已足够使用。

### 7.6 GET `/version/total`

用途：

- 查询版本总数

### 7.7 GET `/version/latest/commit`

用途：

- 查询最新版本对应的 `commit_sha`

说明：

- 当前实现通常按 `version DESC` 查询
- 该接口不是首阶段打包和测试闭环的关键接口

## 8. 错误语义

当前至少需要区分以下错误：

| HTTP | 含义 |
| --- | --- |
| `400` | 参数缺失或状态字段组合非法 |
| `401` | 用户不存在或签名错误 |
| `403` | `product` 不在用户授权范围内 |
| `500` | 服务端内部错误 |

额外约束：

- 当 `/version/pack` 同时传 `packing` 与 `packed` 时，返回 `400`
- 当 `/version/test` 同时传 `testing` 与 `tested` 时，返回 `400`

## 9. 与当前代码对照时的修改重点

后续修改 `/root/work/buckyos-test-server` 时，重点只看下面这些差异：

1. `packed`、`pack_tested`、`published` 要切换到本文档定义的状态码语义
2. `/version/pack` 要支持 `packing`
3. `/version/test` 要支持 `testing`
4. `/version/url` 覆盖同一主键时，要显式把所有状态位重置为 `0`
5. 查询接口继续保留 `notest` 和 `nopack` 语义

做到这些，当前状态中心就与本文档一致。
