一，在原有项目根目录中添加测试模块
1，添加jasmine模块：meteor add sanjo:jasmine（测试模块）
2，添加测试报告模块：meteor add velocity:html-reporter（测试报告模块）
3，添加sinon模块：meteor add practicalmeteor:sinon （辅助测试模块）

二，添加测试代码
1，在原项目根目录下添加jasmine测试目录
   jasmine目录结构：
	-test
		-jasmine
			-client
				-integration
				-unit
			-server
				-integration
				-unit
2，在所需要测试的模块的目录中添加测试代码文件
3，添加完成之后执行: VELOCITY_DEBUG=1 JASMINE_SERVER_UNIT=1 meteor 启动项目
   VELOCITY_DEBUG=1 是设置打印测试程序的启动信息
   JASMINE_SERVER_UNIT=1 是打开服务端单元测试。 
   jasmine一共有4个测试模块：
	   JASMINE_SERVER_UNIT（服务端单元测试）
	   JASMINE_SERVER_INTEGRATION（服务端集成测试）
	   JASMINE_CLIENT_UNIT（客户端单元测试）
	   JASMINE_CLIENT_INTEGRATION（客户端集成测试）
   一般这四个模块都是默认打开的。如果没有打开可直接设置环境变量打开即可。
