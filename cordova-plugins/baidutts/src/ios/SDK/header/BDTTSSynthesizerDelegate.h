//
//  BDTTSSynthesizerDelegate.h
//  BDTTSSynthesizer
//
//  Created by 唐海员 on 14-7-11.
//  Copyright (c) 2014年 百度. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol BDTTSSynthesizerDelegate <NSObject>
@optional
/**
 * @brief 合成器开始工作
 *
 */
- (void)synthesizerStartWorking;

/**
 * @brief 合成器完成合成
 *
 */
- (void)synthesizerFinishWorking;

/**
 * @brief 合成器开始朗读
 *
 */
- (void)synthesizerSpeechStart;

/**
 * @brief 新的语音数据已经合成
 *
 * @param data 语音数据
 */
- (void)synthesizerNewDataArrived: (NSData *)newData;

/**
 * @brief 缓冲进度已更新
 *
 * @param cacheTextLen 已缓冲的待播放文本长度
 */
- (void)synthesizerBufferProgressChanged: (NSInteger)cachedTextLen;

/**
 * @brief 播放进度已更新
 *
 * @param playedTextLen 已播放文本长度
 */
- (void)synthesizerSpeechProgressChanged: (NSInteger)playedTextLen;

/**
 * @brief 当前已缓冲到的文本长度已更新
 *
 * @param length 以缓冲到的文本偏移量，取值范围[0, [text length]]
 */
- (void)synthesizerTextBufferedLengthChanged:(int)newLength;

/**
 * @brief 朗读已暂停
 *
 */
- (void)synthesizerSpeechDidPaused;

/**
 * @brief 朗读已继续
 *
 */
- (void)synthesizerSpeechDidResumed;

/**
 * @brief 朗读完成
 *
 */
- (void)synthesizerSpeechDidFinished;

/**
 * @brief 合成器发生错误
 *
 * @param error 错误对象
 */
- (void)synthesizerErrorOccurred:(NSError *)error;

/**
 * @brief 合成器将开始播报，可以在此消息中设置相应的audio session
 *
 */
- (void)synthesizerSpeechWillStart;
@end
