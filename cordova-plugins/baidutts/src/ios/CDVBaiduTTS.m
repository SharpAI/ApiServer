
#import "CDVBaiduTTS.h"

@implementation CDVBaiduTTS

- (void)pluginInitialize {
    [self initSynthesizer];
}
/*
 - (void)speechSynthesizer:(AVSpeechSynthesizer*)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance*)utterance {
 CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
 if (lastCallbackId) {
 [self.commandDelegate sendPluginResult:result callbackId:lastCallbackId];
 lastCallbackId = nil;
 } else if(callbackId){
 [self.commandDelegate sendPluginResult:result callbackId:callbackId];
 callbackId = nil;
 }
 }*/

#pragma mark - internal function
- (void)initSynthesizer
{
    NSString* appId = [[self.commandDelegate settings] objectForKey:@"app_id"];
    NSString* apiKey = [[self.commandDelegate settings] objectForKey:@"api_key"];
    NSString* apiSecret = [[self.commandDelegate settings] objectForKey:@"api_secret"];
    [BDTTSSynthesizer setLogLevel:BDS_LOG_OFF];
    
    // 设置合成器代理
    [[BDTTSSynthesizer sharedInstance] setSynthesizerDelegate: self];
    
    // 在线相关设置
    [[BDTTSSynthesizer sharedInstance] setApiKey:apiKey withSecretKey:apiSecret];
    [[BDTTSSynthesizer sharedInstance] setTTSServerTimeOut:1];
    
    // 离线相关设置
    NSString *textDataFile =[[NSBundle mainBundle] pathForResource:@"bd_etts_ch_text" ofType:@"dat"];
    NSString *speechDataFile =[[NSBundle mainBundle] pathForResource:@"bd_etts_ch_speech_female" ofType:@"dat"];
    NSString *licenseFile =[[NSBundle mainBundle] pathForResource:@"temp_license_2015-09-23" ofType:@"dat"];
    [[BDTTSSynthesizer sharedInstance] setOfflineEngineLicense:licenseFile  withAppCode:appId];
    [[BDTTSSynthesizer sharedInstance] setOfflineEngineTextDatPath:textDataFile andSpeechData:speechDataFile];
    
    // 合成参数设置
    [[BDTTSSynthesizer sharedInstance] setSynthesizeParam: BDTTS_PARAM_VOLUME withValue: BDTTS_PARAM_VOLUME_MAX];
    
    // 加载合成引擎
    [[BDTTSSynthesizer sharedInstance] loadTTSEngine];
}
- (void)speak:(CDVInvokedUrlCommand*)command {
    
    NSDictionary* options = [command.arguments objectAtIndex:0];
    
    NSString* text = [options objectForKey:@"text"];
    NSString* locale = [options objectForKey:@"locale"];
    double rate = [[options objectForKey:@"rate"] doubleValue];
    
    if (!locale || (id)locale == [NSNull null]) {
        locale = @"en-US";
    }
    
    if (!rate) {
        rate = 1.0;
    }
    NSInteger ret = [[BDTTSSynthesizer sharedInstance] speak:text];
    if (ret != BDTTS_ERR_SYNTH_OK) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        if (command.callbackId){
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }
        return;
    }
    if (callbackId) {
        lastCallbackId = callbackId;
    }
    
    callbackId = command.callbackId;
}

- (void)stop:(CDVInvokedUrlCommand*)command {
    //[synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    [[BDTTSSynthesizer sharedInstance] cancel];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    if (lastCallbackId) {
        [self.commandDelegate sendPluginResult:result callbackId:lastCallbackId];
        lastCallbackId = nil;
    }
    if(callbackId){
        [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        callbackId = nil;
    }
}
#pragma mark - BDTTSSynthesizerDelegate
- (void)synthesizerStartWorking
{
    MyLog(@"开始合成");
}

- (void)synthesizerFinishWorking
{
    MyLog(@"合成完成");
}

- (void)synthesizerSpeechStart
{
    MyLog(@"开始播放");
}

- (void)synthesizerNewDataArrived: (NSData *)newData
{
    
}

- (void)synthesizerBufferProgressChanged: (NSInteger)cachedTextLen
{
}

- (void)synthesizerSpeechDidPaused
{
    MyLog(@"播放已暂停");
}

- (void)synthesizerSpeechDidResumed
{
    MyLog(@"播放已恢复");
}

- (void)synthesizerSpeechDidFinished
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    if (lastCallbackId) {
        [self.commandDelegate sendPluginResult:result callbackId:lastCallbackId];
        lastCallbackId = nil;
    } else if(callbackId){
        [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        callbackId = nil;
    }
    MyLog(@"播放已完成");
}
@end
