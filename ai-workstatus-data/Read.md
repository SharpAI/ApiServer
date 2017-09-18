# mongo-client 
mongo-client version >= 3.2

# 使用步骤
> 使用前，请先修改相应的数据链接 url 和 账户/密码
### step 1. 修改`workstatus.sh`
```
修改 fillWorkStatus 相应参数 
fillWorkStatus(group_id,dayLen,time_offset);
// dayLen 表示要更新最近 dayLen 天的数据
```

### step 2. 更新数据
```
./workstatus.sh
```