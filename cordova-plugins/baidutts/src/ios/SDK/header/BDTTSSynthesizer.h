//
//  BDTTSSynthesizer.h
//  BDTTSSynthesizer
//
//  Created by baidu on 11/14/14.
//  Copyright (c) 2014 baidu. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "BDTTSSynthesizerDefine.h"
#import "BDTTSSynthesizerDelegate.h"

@interface BDTTSSynthesizer : NSObject
/**
 * @brief 获取合成器唯一实例
 *
 * @return 返回合成器唯一实例
 */
+ (BDTTSSynthesizer*)sharedInstance;

/**
 * @brief 释放合成器唯一实例
 *
 *
 */
+ (void)releaseInstance;

/**
 * @brief 设置合成器代理
 *
 * @param delegate 代理对象，负责处理合成器各类事件
 *
 * @return 识别器对象
 */
- (void)setSynthesizerDelegate: (id<BDTTSSynthesizerDelegate>)delegate;

/**
 * @brief 设置合成策略, 合成过程中设置无效
 *
 * @param strategy 合成策略
 */
- (void)setTTSStrategy:(BDTTSStrategy)strategy;

/**
 * @brief 设置离线引擎音库文件路径
 *
 * @param textDatpath 文本分析数据文件路径
 * @param speechDatPath 声学模型数据文件路径
 */
- (void)setOfflineEngineTextDatPath:(NSString*)textDatpath andSpeechData:(NSString*)speechDatPath;

/**
 * @brief 重新加载文本分析数据文件或者声学模型数据文件
 *
 * @param datFilePath: 数据文件路径
 *
 * @return 错误码
 */
- (NSInteger)reinitOfflineEngineData: (NSString*)datFilePath;

/**
 * @brief 设置离线引擎授权相关信息
 *
 * @param licenseFilePath 授权文件默认路径，如为nil则使用默认按bundle目录和document目录查找名为bdtts_license.dat的文件
 * @param appCode 用户获取的授权产品标示
 *
 */
- (void)setOfflineEngineLicense:(NSString*)licenseFilePath withAppCode:(NSString*)appCode;

/**
 * @brief 设置离线引擎合成线程优先级，请在loadTTSEngine前调用
 *
 * @param priority 线程优先级，取值范围[0.0, 1.0]，默认0.5
 */
- (void)setOfflineEngineThreadPriority:(double)priority;

/**
 * @brief 设置在线合成引擎需要的认证信息
 *
 * @param apiKey 在百度开发者中心注册应用获得
 * @param secretKey 在百度开发者中心注册应用获得
 */
- (void)setApiKey:(NSString *)apiKey withSecretKey:(NSString *)secretKey;

/**
 * @brief 如果与百度语音技术部有直接合作关系，才需要考虑此方法，否则请勿随意设置服务器地址
 *
 * @param url tts合成服务器地址
 *
 */
- (void)setTTSServerURL: (NSString*)url;

/**
 * @brief 设置tts超时时间
 *
 */
- (void)setTTSServerTimeOut: (NSTimeInterval)time;

/**
 * @brief 设置合成参数，如果不设置，则使用默认值
 *
 * @param paramType 参数类型
 * @param paramValue 参数的值
 *
 */
- (void)setSynthesizeParam: (BDTTS_PARAM_TYPE)paramType withValue: (NSInteger)paramValue;

/**
 * @brief 根据合成策略，加载在线合成引擎或者离线合成引擎
 *
 * @return 错误码
 */
- (NSInteger)loadTTSEngine;

/**
 * @brief 获取播放器状态
 *
 */
- (BDSPlayerStatus)playerStatus;

/**
 * @brief 开始文本合成但不朗读，开发者需要通过BDSEmbeddedSynthesizerDelegate的
 *        synthesizerNewDataArrived:data:方法传回的数据自行播放
 *
 * @param text 需要语音合成的文本
 *
 * @return 错误码
 */
- (NSInteger)synthesize:(NSString *)text;

/**
 * @brief 开始文本合成并朗读
 *
 * @param text 需要朗读的文本
 *
 * @return 错误码
 */
- (NSInteger)speak:(NSString *)text;

/**
 * @brief 取消本次合成并停止朗读
 */
- (NSInteger)cancel;

/**
 * @brief 暂停文本朗读
 *
 * @return 错误码
 */
- (NSInteger)pause;

/**
 * @brief 继续文本朗读
 *
 * @return 错误码
 */
- (NSInteger)resume;

/**
 * @brief 验证离线合成引擎音库文件的有效性
 * @param datFilePath data文件路径
 * @param err 如果验证失败, 返回错误信息
 *
 * @return 验证成功YES，失败NO
 */
- (BOOL)verifyOfflineEngineDataFile: (NSString*) datFilePath error:(NSError**)err;

/**
 * @brief 获取离线合成引擎音库文件相关参数
 * @param datFilePath data文件路径
 * @param paramType 参数类型
 * @param paramValue 传出对应参数的值
 * @param err 如果失败, 返回错误信息
 *
 * @return 成功YES，失败NO
 */
- (BOOL)getOfflineEngineDataFileParam: (NSString*)datFilePath
                                 type: (TTSDataParam)paramType
                                value: (NSString**)paramValue
                                error: (NSError**)err;

/**
 * @brief 是否禁用设置audiosession相关的逻辑，合成前设置
 * @param flag 设置为YES禁用audiosession相关操作，默认为NO
 *
 */
- (void)setDisableAudioSessionFlag:(BOOL)flag;

/**
 * @brief 获取错误码对应的描述
 *
 * @param errorCode 错误码
 *
 * @return 错误描述信息
 */
+ (NSString *)errorDescriptionForCode:(NSInteger)errorCode;

/**
 * @brief 设置日志级别
 *
 * @param logLevel 日志级别
 */
+ (void)setLogLevel:(BDSLogLevel)logLevel;

/**
 * @brief 获取当前日志级别
 *
 * @return 日志级别
 */
+ (BDSLogLevel)logLevel;

/**
 * @brief 设置库
 *
 * @return 库版本代码
 */
+ (NSString *)libVersion;
@end
