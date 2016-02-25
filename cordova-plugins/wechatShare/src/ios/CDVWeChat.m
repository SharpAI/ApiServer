/*
    Cordova WeChat Plugin
    https://github.com/vilic/cordova-plugin-wechat

    by VILIC VANE
    https://github.com/vilic

    MIT License
*/

#import <Foundation/Foundation.h>
#import "CDVWeChat.h"

NSString* WECHAT_APPID_KEY = @"wechatappid";
NSString* ERR_WECHAT_NOT_INSTALLED = @"ERR_WECHAT_NOT_INSTALLED";
NSString* ERR_INVALID_OPTIONS = @"ERR_INVALID_OPTIONS";
NSString* ERR_UNSUPPORTED_MEDIA_TYPE = @"ERR_UNSUPPORTED_MEDIA_TYPE";
NSString* ERR_USER_CANCEL = @"ERR_USER_CANCEL";
NSString* ERR_AUTH_DENIED = @"ERR_AUTH_DENIED";
NSString* ERR_SENT_FAILED = @"ERR_SENT_FAILED";
NSString* ERR_COMM = @"ERR_COMM";
NSString* ERR_UNSUPPORT = @"ERR_UNSUPPORT";
NSString* ERR_UNKNOWN = @"ERR_UNKNOWN";
NSString* NO_RESULT = @"NO_RESULT";
NSString* WX_BASE_URL = @"https://api.weixin.qq.com/sns";
NSString* WXDoctor_App_Secret = @"dbafa3cb0167bbb80bb201ba10127da4";
NSString* WXDoctor_App_ID = @"";
NSString* WX_ACCESS_TOKEN = @"access_token";
NSString* WX_OPEN_ID = @"openid";
NSString* WX_REFRESH_TOKEN = @"refresh_token";
NSString* WX_UNION_ID = @"unionid";

const int SCENE_CHOSEN_BY_USER = 0;
const int SCENE_SESSION = 1;
const int SCENE_TIMELINE = 2;

@implementation CDVWeChat

- (void)pluginInitialize {
    WXDoctor_App_ID = [[self.commandDelegate settings] objectForKey:WECHAT_APPID_KEY];
    self.wechatAppId = WXDoctor_App_ID;
    [WXApi registerApp: WXDoctor_App_ID];
}

- (void)setThumbImage:(SendMessageToWXReq *)req image:(UIImage *)image
{
    if (image) {
        CGFloat width = 100.0f;
        CGFloat height = image.size.height * 100.0f / image.size.width;
        UIGraphicsBeginImageContext(CGSizeMake(width, height));
        [image drawInRect:CGRectMake(0, 0, width, height)];
        UIImage *scaledImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        [req.message setThumbImage:scaledImage];
    }
}

-(UIImage*)getImage: (NSString *)imageName {
    UIImage *image = nil;
    if (imageName != (id)[NSNull null]) {
        if ([imageName hasPrefix:@"http"]) {
            image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:imageName]]];
        } else if ([imageName hasPrefix:@"www/"]) {
            image = [UIImage imageNamed:imageName];
        } else if ([imageName hasPrefix:@"file://"]) {
            image = [UIImage imageWithData:[NSData dataWithContentsOfFile:[[NSURL URLWithString:imageName] path]]];
        } else if ([imageName hasPrefix:@"data:"]) {
            // using a base64 encoded string
            NSURL *imageURL = [NSURL URLWithString:imageName];
            NSData *imageData = [NSData dataWithContentsOfURL:imageURL];
            image = [UIImage imageWithData:imageData];
        } else if ([imageName hasPrefix:@"assets-library://"]) {
            // use assets-library
            NSURL *imageURL = [NSURL URLWithString:imageName];
            NSData *imageData = [NSData dataWithContentsOfURL:imageURL];
            image = [UIImage imageWithData:imageData];
        } else {
            // assume anywhere else, on the local filesystem
            image = [UIImage imageWithData:[NSData dataWithContentsOfFile:imageName]];
        }
    }
    return image;
}

- (void)share:(CDVInvokedUrlCommand*)command {
    CDVPluginResult* result = nil;
    
    if (![WXApi isWXAppInstalled]) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_WECHAT_NOT_INSTALLED];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return ;
    }
    
    NSDictionary* params = [command.arguments objectAtIndex:0];
    if (!params) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_INVALID_OPTIONS];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return ;
    }
    
    SendMessageToWXReq* request = [SendMessageToWXReq new];
    
    if ([params objectForKey:@"scene"]) {
        int paramScene = [[params objectForKey:@"scene"] integerValue];
        
        switch (paramScene) {
            case SCENE_SESSION:
                request.scene = WXSceneSession;
                break;
            case SCENE_CHOSEN_BY_USER:
            case SCENE_TIMELINE:
            default:
                request.scene = WXSceneTimeline;
                break;
        }
    } else {
        request.scene = WXSceneTimeline;
    }
    
    NSDictionary* messageOptions = [params objectForKey:@"message"];
    NSString* text = [params objectForKey:@"text"];
    
    if ((id)messageOptions == [NSNull null]) {
        messageOptions = nil;
    }
    if ((id)text == [NSNull null]) {
        text = nil;
    }
    
    if (messageOptions) {
        request.bText = NO;
        
        NSString* url = [messageOptions objectForKey:@"url"];
        NSString* data = [messageOptions objectForKey:@"data"];
        
        if ((id)url == [NSNull null]) {
            url = nil;
        }
        if ((id)data == [NSNull null]) {
            data = nil;
        }
        
        WXMediaMessage* message = [WXMediaMessage message];
        id mediaObject = nil;
        
        int type = [[messageOptions objectForKey:@"type"] integerValue];
        
        if (!type) {
            type = CDVWeChatShareTypeWebpage;
        }
        
        switch (type) {
            case CDVWeChatShareTypeApp:
                break;
            case CDVWeChatShareTypeEmotion:
                break;
            case CDVWeChatShareTypeFile:
                break;
            case CDVWeChatShareTypeImage:
                mediaObject = [WXImageObject object];
                if (url) {
                    ((WXImageObject*)mediaObject).imageUrl = url;
                } else if (data) {
                    ((WXImageObject*)mediaObject).imageData = [self decodeBase64:data];
                } else {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_INVALID_OPTIONS];
                    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
                    return ;
                }
                break;
            case CDVWeChatShareTypeMusic:
                break;
            case CDVWeChatShareTypeVideo:
                break;
            case CDVWeChatShareTypeWebpage:
            default:
                mediaObject = [WXWebpageObject object];
                ((WXWebpageObject*)mediaObject).webpageUrl = url;
                break;
        }
        
        if (!mediaObject) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_UNSUPPORTED_MEDIA_TYPE];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
            return ;
        }
        
        message.mediaObject = mediaObject;
        
        message.title = [messageOptions objectForKey:@"title"];
        message.description = [messageOptions objectForKey:@"description"];
        request.message = message;
        
        UIImage* image = [self getImage:[messageOptions objectForKey:@"thumbData"]];
        [self setThumbImage:request image:image];
        
    } else if (text) {
        request.bText = YES;
        request.text = text;
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_INVALID_OPTIONS];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return ;
    }
    
    BOOL success = [WXApi sendReq:request];
    
    if (success) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_UNKNOWN];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    self.currentCallbackId = command.callbackId;
}

- (NSData*)decodeBase64:(NSString*)base64String {
    NSString* dataUrl =[NSString stringWithFormat:@"data:application/octet-stream;base64,%@", base64String];
    NSURL* url = [NSURL URLWithString: dataUrl];
    return [NSData dataWithContentsOfURL:url];
}

- (void)onResp:(BaseResp*)resp {
    if (!self.currentCallbackId) {
        return;
    }
    
    CDVPluginResult* result = nil;
    
    if([resp isKindOfClass:[SendMessageToWXResp class]]||[resp isKindOfClass:[SendAuthResp class]]) {
        switch (resp.errCode) {
            case WXSuccess:{
                
                if ([resp isKindOfClass:[SendAuthResp class]]) {
                    
                    SendAuthResp *authResp = (SendAuthResp *)resp;
                    
                    [self managerDidRecvAuthResponse:authResp];
                    
                    return;
                }
                else{
                    
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                }
                
                break;
            }
                
            case WXErrCodeUserCancel:
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_USER_CANCEL];
                break;
            case WXErrCodeSentFail:
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_SENT_FAILED];
                break;
            case WXErrCodeAuthDeny:
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_AUTH_DENIED];
                break;
            case WXErrCodeUnsupport:
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_UNSUPPORT];
                break;
            case WXErrCodeCommon:
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_COMM];
                break;
            default:
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_UNKNOWN];
                break;
        }
    }
    
    
    [self.commandDelegate sendPluginResult:result callbackId:self.currentCallbackId];
    
    self.currentCallbackId = nil;
}

#pragma mark - 微信登录
/*
 目前移动应用上德微信登录只提供原生的登录方式，需要用户安装微信客户端才能配合使用。
 对于iOS应用,考虑到iOS应用商店审核指南中的相关规定，建议开发者接入微信登录时，先检测用户手机是否已经安装
 微信客户端(使用sdk中的isWXAppInstall函数),对于未安装的用户隐藏微信 登录按钮，只提供其他登录方式。
 */

-(void)getUserInfo:(CDVInvokedUrlCommand *)command
{
    self.currentCallbackId = command.callbackId;
    
    NSString *accessToken = [[NSUserDefaults standardUserDefaults] objectForKey:WX_ACCESS_TOKEN];
    NSString *openID = [[NSUserDefaults standardUserDefaults] objectForKey:WX_OPEN_ID];
    // 如果已经请求过微信授权登录，那么考虑用已经得到的access_token
    if (accessToken && openID){
        
        NSURLSession *session = [NSURLSession sharedSession];
        
        NSString *refreshToken = [[NSUserDefaults standardUserDefaults] objectForKey:WX_REFRESH_TOKEN];
        
        NSString *refreshUrlStr = [NSString stringWithFormat:@"%@/oauth2/refresh_token?appid=%@&grant_type=refresh_token&refresh_token=%@", WX_BASE_URL, WXDoctor_App_ID, refreshToken];
        
        [[session dataTaskWithURL:[NSURL URLWithString:refreshUrlStr]
                completionHandler:^(NSData *data,
                                    NSURLResponse *response,
                                    NSError *error) {
                    // handle response
                    if (error) {
                        
                        NSLog(@"请求reAccess的错误信息：%@",error);
                    }
                    
                    NSError *JSONError = nil;
                    id JSONObject = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableLeaves error:&JSONError];
                    NSLog(@"请求reAccess的response = %@", JSONObject);
                    
                    NSDictionary *refreshDict = [NSDictionary dictionaryWithDictionary:JSONObject];
                    NSString *reAccessToken = [refreshDict objectForKey:WX_ACCESS_TOKEN];
                    // 如果reAccessToken为空,说明reAccessToken也过期了,反之则没有过期
                    if (reAccessToken) {
                        // 更新access_token、refresh_token、open_id
                        [[NSUserDefaults standardUserDefaults] setObject:reAccessToken forKey:WX_ACCESS_TOKEN];
                        [[NSUserDefaults standardUserDefaults] setObject:[refreshDict objectForKey:WX_OPEN_ID] forKey:WX_OPEN_ID];
                        [[NSUserDefaults standardUserDefaults] setObject:[refreshDict objectForKey:WX_REFRESH_TOKEN] forKey:WX_REFRESH_TOKEN];
                        [[NSUserDefaults standardUserDefaults] synchronize];
                        // 当存在reAccessToken不为空时直接执行AppDelegate中的wechatLoginByRequestForUserInfo方法
                        [self wechatLoginByRequestForUserInfo];
                        
                    }
                    else{
                        
                        [self sendAuthRequest];
                    }
                    
                }] resume];
    }
    else{
        
        [self sendAuthRequest];
    }
  
}

-(void)sendAuthRequest
{
    CDVPluginResult* result = nil;
    
    if (![WXApi isWXAppInstalled]) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_WECHAT_NOT_INSTALLED];
       
        [self.commandDelegate sendPluginResult:result callbackId:self.currentCallbackId];
        return ;
    }
    //构造SendAuthReq结构体
    SendAuthReq* req =[[SendAuthReq alloc ] init];
    req.scope = @"snsapi_userinfo" ;
    req.state = @"wechat_sdk_hotShare" ;
    //第三方向微信终端发送一个SendAuthReq消息结构
    BOOL success = [WXApi sendReq:req];
    
    if (!success) {
        
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:ERR_UNKNOWN];
        [self.commandDelegate sendPluginResult:result callbackId:self.currentCallbackId];
        return;
    }
    
}

- (void)managerDidRecvAuthResponse:(SendAuthResp *)resp{
    
    NSString *strTitle = [NSString stringWithFormat:@"Auth结果"];
    NSString *strMsg = [NSString stringWithFormat:@"code:%@,state:%@,errcode:%d", resp.code, resp.state, resp.errCode];
    
    NSLog(@"%@:%@",strTitle,strMsg);
    
    
    NSURLSession *session = [NSURLSession sharedSession];
    
    NSString *accessUrlStr = [NSString stringWithFormat:@"%@/oauth2/access_token?appid=%@&secret=%@&code=%@&grant_type=authorization_code", WX_BASE_URL, WXDoctor_App_ID, WXDoctor_App_Secret, resp.code];
    
    [[session dataTaskWithURL:[NSURL URLWithString:accessUrlStr]
            completionHandler:^(NSData *data,
                                NSURLResponse *response,
                                NSError *error) {
                
                // handle response
                
                if (error) {
                     CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"access resonce failed"];
                    [self.commandDelegate sendPluginResult:result callbackId:self.currentCallbackId];
                    return ;
                }
                
                NSError *JSONError = nil;
                id JSONObject = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableLeaves error:&JSONError];
                NSLog(@"请求access的response = %@", JSONObject);
                if (JSONError) {
                    
                    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"access resonce failed"];
                    [self.commandDelegate sendPluginResult:result callbackId:self.currentCallbackId];
                    return ;
                }
                NSDictionary *accessDict = [NSDictionary dictionaryWithDictionary:JSONObject];
                NSString *accessToken = [accessDict objectForKey:WX_ACCESS_TOKEN];
                NSString *openID = [accessDict objectForKey:WX_OPEN_ID];
                NSString *refreshToken = [accessDict objectForKey:WX_REFRESH_TOKEN];
                // 本地持久化，以便access_token的使用、刷新或者持续
                if (accessToken && ![accessToken isEqualToString:@""] && openID && ![openID isEqualToString:@""]) {
                    [[NSUserDefaults standardUserDefaults] setObject:accessToken forKey:WX_ACCESS_TOKEN];
                    [[NSUserDefaults standardUserDefaults] setObject:openID forKey:WX_OPEN_ID];
                    [[NSUserDefaults standardUserDefaults] setObject:refreshToken forKey:WX_REFRESH_TOKEN];
                    [[NSUserDefaults standardUserDefaults] synchronize]; // 命令直接同步到文件里，来避免数据的丢失
                }
                
                [self wechatLoginByRequestForUserInfo];
                
            }] resume];

    
}

// 获取用户个人信息（UnionID机制）
- (void)wechatLoginByRequestForUserInfo{
    
    NSString *accessToken = [[NSUserDefaults standardUserDefaults] objectForKey:WX_ACCESS_TOKEN];
    NSString *openID = [[NSUserDefaults standardUserDefaults] objectForKey:WX_OPEN_ID];
    NSString *userUrlStr = [NSString stringWithFormat:@"%@/userinfo?access_token=%@&openid=%@", WX_BASE_URL, accessToken, openID];
    
    NSURLSession *session = [NSURLSession sharedSession];
    
    [[session dataTaskWithURL:[NSURL URLWithString:userUrlStr]
            completionHandler:^(NSData *data,
                                NSURLResponse *response,
                                NSError *error) {
                // handle response
                
                CDVPluginResult* result = nil;
                if (error) {
                    
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"请求用户信息失败"];
                    [self.commandDelegate sendPluginResult:result callbackId:self.currentCallbackId];
                    return ;
                }
                NSError *JSONError = nil;
                id JSONObject = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableLeaves error:&JSONError];
                
                if (JSONError) {
                    
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"请求用户信息失败"];
                    
                }
                else{
                    NSDictionary *userDict = [NSDictionary dictionaryWithDictionary:JSONObject];
                    NSLog(@"请求用户信息的response = %@", userDict);
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:userDict];
              
                }

                [self.commandDelegate sendPluginResult:result callbackId:self.currentCallbackId];
                
            }] resume];

}

- (void)handleOpenURL:(NSNotification*)notification {
    
    NSURL* url = [notification object];
    
    NSLog(@"url.scheme:%@,wechatAppId:%@",url.scheme,self.wechatAppId);
    
    if ([url isKindOfClass:[NSURL class]] && [url.scheme isEqualToString:self.wechatAppId]) {
        
          [WXApi handleOpenURL:url delegate:self];
        
    }
}

@end