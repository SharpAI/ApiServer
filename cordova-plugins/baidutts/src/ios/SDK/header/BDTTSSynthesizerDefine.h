//
//  BDTTSSynthesizerDefine.h
//  BDTTSSynthesizer
//
//  Created by 唐海员 on 14-7-11.
//  Copyright (c) 2014年 百度. All rights reserved.
//

#import <Foundation/Foundation.h>

/**
 * @brief 日志级别枚举类型
 */
typedef enum BDSLogLevel
{
    BDS_LOG_OFF = 0,
    BDS_LOG_ERROR = 1,
    BDS_LOG_WARN = 2,
    BDS_LOG_INFO = 3,
    BDS_LOG_DEBUG = 4,
    BDS_LOG_VERBOSE = 5,
} BDSLogLevel;

typedef enum BDTTSStrategy
{
    BDTTS_STRATEGY_ONLINE,                  /** 在线合成 */
    BDTTS_STRATEGY_OFFLINE,                 /** 离线合成 */
    BDTTS_STRATEGY_ONLINE_PRI,              /** 在线优先 */
    BDTTS_STRATEGY_OFFLINE_PRI,             /** 离线优先 */
}BDTTSStrategy;

/**
 * @brief 合成器参数类型
 */
typedef enum BDTTS_PARAM_TYPE
{
	BDTTS_PARAM_PERSON = 1,                 /** 发音人, 离线合成无效, 离线合成需设置相应音库 */
	BDTTS_PARAM_VOICE_STYLE,                /** 朗读风格, 暂不支持 */
	BDTTS_PARAM_DIGIT_MODE,                 /** 数字读法, 暂不支持 */
	BDTTS_PARAM_CODING_FORMAT,              /** 编码格式, 离线无效 */
	BDTTS_PARAM_VOLUME,                     /** 音量 */
	BDTTS_PARAM_SPEED,                      /** 语速 */
	BDTTS_PARAM_PITCH,                      /** 音调 */
	BDTTS_PARAM_BACKGROUND,                 /** 背景音, 暂不支持 */
	BDTTS_PARAM_OPEN_XML,                   /** 启用xml文本标记, 暂不支持 */
	BDTTS_PARAM_PUNC_MODE,                  /** 标点符号读法, 暂不支持 */
	BDTTS_PARAM_SYMBOL_FILTER,              /** 连续符号过滤方式, 暂不支持 */
	BDTTS_PARAM_ONE_MODE,                   /** "一读法", 暂不支持 */
	BDTTS_PARAM_TWO_MODE,                   /** "二读法", 暂不支持 */
	BDTTS_PARAM_ENG_MODE,                   /** 英文读法, 暂不支持 */
	BDTTS_PARAM_AUDIO_FORMAT,               /** 合成语音压缩格式, 离线无效, 离线固定输出pcm */
	BDTTS_PARAM_DOMAIN,                     /** 领域(如金融，天气等), 暂不支持*/
    BDTTS_PARAM_VOCODER_OPTIM_LEVEL,        /** 引擎优化级别，仅对离线合成有效 */
    BDTTS_PARAM_LANGUAGE,                   /** 合成语言类型, 离线无效 */
    BDTTS_PARAM_AUDIO_RATE,                 /** 合成语音采样率，离线无效, 默认16K */
    BDTTS_PARAM_PRODUCT_ID,                 /** 合成产品id */
//    BDTTS_PARAM_VOICE_DATA_MODE,            /** 语音数据模式，暂时不可用*/
	BDTTS_PARAM_MAX_VALUE,
}BDTTS_PARAM_TYPE;

// 发音人
typedef enum BDTTS_SPEAK_PERSON
{
    BDTTS_SPEAK_PERSON_FEMALE = 0,          /** 女声, 默认值 */
    BDTTS_SPEAK_PERSON_MALE = 1,            /** 男声 */
}BDTTS_SPEAK_PERSON;

// 合成语言类型
typedef enum BDTTS_LANGUAGE
{
    BDTTS_LANGUAGE_ZH = 0,                  /** 中文 */
    BDTTS_LANGUAGE_EN = 1,                  /** 英文 */
}BDTTS_LANGUAGE;
    
// 文本编码格式
typedef enum BDTTS_CODING_FORMAT
{
    BDTTS_CODING_FORMAT_GBK = 0,            /** GB2312/GBK, 默认值 */
    BDTTS_CODING_FORMAT_BIG5 = 1,           /** Big5 */
    BDTTS_CODING_FORMAT_UTF8 = 2,           /** Unicode（含UTF16LE、UTF16BE、UTF8等） */
}BDTTS_CODING_FORMAT;

// 合成语音压缩类型
typedef enum BDTTS_AUDIO_AUE
{
    BDTTS_AUDIO_AUE_BV = 0,                 /** 采样率固定为16K */
    BDTTS_AUDIO_AUE_AMR = 1,                /**  */
    BDTTS_AUDIO_AUE_OPUS = 2,               /**  */
    BDTTS_AUDIO_AUE_MP3 = 3,                /** 默认值 */
}BDTTS_AUDIO_AUE;
    
// BV格式的采样率，固定为16K
FOUNDATION_EXPORT NSInteger const BDTTS_AUDIO_BV_16K /*= 0*/;
    
// AMR格式的采样率
typedef enum BDTTS_AUDIO_AMR_RATE
{
    BDTTS_AUDIO_AMR_RATE_6K6 = 0,
    BDTTS_AUDIO_AMR_RATE_8K85 = 1,
    BDTTS_AUDIO_AMR_RATE_12K65 = 2,
    BDTTS_AUDIO_AMR_RATE_14K25 = 3,
    BDTTS_AUDIO_AMR_RATE_15K85 = 4,         /** 默认值 */
    BDTTS_AUDIO_AMR_RATE_18K25 = 5,
    BDTTS_AUDIO_AMR_RATE_19K85 = 6,
    BDTTS_AUDIO_AMR_RATE_23K05 = 7,
    BDTTS_AUDIO_AMR_RATE_23K85 = 8,
}BDTTS_AUDIO_AMR_RATE;
    
// OPUS格式的采样率
typedef enum BDTTS_AUDIO_OPUS_RATE
{
    BDTTS_AUDIO_OPUS_RATE_8K = 0,
    BDTTS_AUDIO_OPUS_RATE_16K = 1,          /** 默认值 */
    BDTTS_AUDIO_OPUS_RATE_18K = 2,
    BDTTS_AUDIO_OPUS_RATE_20K = 3,
    BDTTS_AUDIO_OPUS_RATE_24K = 4,
    BDTTS_AUDIO_OPUS_RATE_32K = 5,
}BDTTS_AUDIO_OPUS_RATE;
    
// MP3格式的采样率
typedef enum BDTTS_AUDIO_MP3_RATE
{
    BDTTS_AUDIO_MP3_RATE_8K = 0,
    BDTTS_AUDIO_MP3_RATE_11K = 1,
    BDTTS_AUDIO_MP3_RATE_16K = 2,           /** 默认值 */
    BDTTS_AUDIO_MP3_RATE_24K = 3,
    BDTTS_AUDIO_MP3_RATE_32K = 4,
}BDTTS_AUDIO_MP3_RATE;

// 发音人可设置的参数
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_PERSON_CH_FEMALE_F7 /*= 0*/; // 中文女声 f7 中文默认
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_PERSON_CH_MALE_MCAS /*= 1*/; // 中文男声 MCAS
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_PERSON_EN_FEMALE_ROSE /*= 10*/; // 英文女声 rose 英文默认
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_PERSON_EN_MALE_JACK /*= 11*/; // 英文男声 Jack

// 音量参数取值范围：大于等于0，小于等于9的整数：
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_VOLUME_MAX /*= 9*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_VOLUME_DEF /*= 5*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_VOLUME_MIN /*= 0*/;

// 语速参数取值范围：大于等于0，小于等于9的整数：
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_SPEED_MAX /*= 9*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_SPEED_DEF /*= 5*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_SPEED_MIN /*= 0*/;

// 基频参数取值范围：大于等于0，小于等于9的整数：
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_PITCH_MAX /*= 9*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_PITCH_DEF /*= 5*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_PITCH_MIN /*= 0*/;

// VOCODER优化等级：// 0级表示没有优化，音质效果最好，数值越大速度越快，但音质效果会降低
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_VOCODER_OPTIM_LEVEL_0 /*= 0*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_VOCODER_OPTIM_LEVEL_1 /*= 1*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_VOCODER_OPTIM_LEVEL_2 /*= 2*/;

// 语音数据模式：
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_OPEN_VOICE_DATA_MODE /*= 1*/;
FOUNDATION_EXPORT NSInteger const BDTTS_PARAM_CLOSE_VOICE_DATA_MODE /*= 0*/;

// 传入合成引擎最大文本字符串长度
FOUNDATION_EXPORT NSInteger const BDTTS_ENGINE_MAX_TEXT_BUF_LEN /*= 1024*/;

// error code define
// 合成器错误
FOUNDATION_EXPORT NSString* const BDTTS_ERR_DOMAIN_SYNTHESIZER;
typedef enum BDSErrSynthesizer{
    BDTTS_ERR_SYNTH_OK = 0,
    BDTTS_ERR_SYNTH_EMPTY_TEXT = 1,
    BDTTS_ERR_SYNTH_BUSY,
    BDTTS_ERR_SYNTH_NOT_START,
    BDTTS_ERR_SYNTH_ENGINE_NOT_INIT,
    BDTTS_ERR_SYNTH_PARAM_INVALID,
    BDTTS_ERR_SYNTH_CREATE_ENGINE,
    BDTTS_ERR_SYNTH_NETWORK_UNAVAILABLE,
    BDTTS_ERR_SYNTH_CREATE_PLAYER,
    BDTTS_ERR_SYNTH_PLAYER_NOT_INIT,
}BDSErrSynthesizer;

// 引擎错误
FOUNDATION_EXPORT NSString* const BDTTS_ERR_DOMAIN_ENGINE;
FOUNDATION_EXPORT NSInteger const BDTTS_ERR_MASK_ENGINE /*= 10000*/;
typedef enum BDTTSErrEngine{
    BDTTS_ERR_ENGINE_OK = 0,
    BDTTS_ERR_ENGINE_PARTIAL_SYNTH = 10001,
    BDTTS_ERR_ENGINE_CONFIG,
    BDTTS_ERR_ENGINE_RESOURCE,
    BDTTS_ERR_ENGINE_HANDLE,
    BDTTS_ERR_ENGINE_PARMAM,
    BDTTS_ERR_ENGINE_MEMORY,
    BDTTS_ERR_ENGINE_MANY_TEXT,
    BDTTS_ERR_ENGINE_RUN_TIME,
    BDTTS_ERR_ENGINE_NO_TEXT,
    BDTTS_ERR_ENGINE_LICENSE,
    BDTTS_ERR_ENGINE_MALLOC,
    BDTTS_ERR_ENGINE_ENGINE_NOT_INIT,
    BDTTS_ERR_ENGINE_SESSION_NOT_INIT,
    BDTTS_ERR_ENGINE_GET_LICENSE,
    BDTTS_ERR_ENGINE_LICENSE_EXPIRED,
    BDTTS_ERR_ENGINE_VERIFY_LICENSE,
    BDTTS_ERR_ENGINE_INVALID_PARAM,
    BDTTS_ERR_ENGINE_DATA_FILE_NOT_EXIST,
    BDTTS_ERR_ENGINE_VERIFY_DATA_FILE,
    BDTTS_ERR_ENGINE_GET_DATA_FILE_PARAM,
    BDTTS_ERR_ENGINE_ENCODE_TEXT,
    BDTTS_ERR_ENGINE_ENGINE_DATA_INVALID,
    BDTTS_ERR_ENGINE_BUSY,
    BDTTS_ERR_ENGINE_NETWORK_NOT_CONNECTED,
    BDTTS_ERR_ENGINE_NO_VERFIFY_INFO,
    BDTTS_ERR_ENGINE_GET_ACCESS_TOKEN_FAILED,
    BDTTS_ERR_ENGINE_ENCODE_NOT_SUPPORTED,
    BDTTS_ERR_ENGINE_RESPONSE_PARSE_ERROR,
    BDTTS_ERR_ENGINE_RECEIVE_TIME_OUT,
    BDTTS_ERR_ENGINE_ACCESS_HTTP_SERVER,
}BDTTSErrEngine;

// 播放器状态
typedef enum BDSPlayerStatus{
    BDS_PLAYER_STATUS_NOT_INIT = 0,
    BDS_PLAYER_STATUS_IDLE,
    BDS_PLAYER_STATUS_PLAYING,
    BDS_PLAYER_STATUS_PAUSE,
    BDS_PLAYER_STATUS_ERROR
}BDSPlayerStatus;

// 播放器错误
FOUNDATION_EXPORT NSString* const BDTTS_ERR_DOMAIN_PLAYER;
FOUNDATION_EXPORT NSInteger const BDTTS_ERR_MASK_PLAYER /*= 20000*/;
typedef enum BDSErrPlayer{
    BDTTS_ERR_PLAYER_OK = 0,
    BDTTS_ERR_PLAYER_ALLOC_BUF = 20001,
    BDTTS_ERR_PLAYER_START,
    BDTTS_ERR_PLAYER_PAUSE,
    BDTTS_ERR_PLAYER_RESUME,
    BDTTS_ERR_PLAYER_STOP,
} BDSErrPlayer;

FOUNDATION_EXPORT NSString* const BDTTS_ERR_DOMAIN_SERVER;
FOUNDATION_EXPORT NSInteger const BDTTS_ERR_MASK_SERVER /*= 40000*/;

// 音库文件相关参数
typedef enum TTSDataParam{
    TTS_DATA_PARAM_DATE,
    TTS_DATA_PARAM_SPEAKER,
    TTS_DATA_PARAM_GENDER,
    TTS_DATA_PARAM_CATEGORY,
    TTS_DATA_PARAM_LANGUAGE,
}TTSDataParam;


