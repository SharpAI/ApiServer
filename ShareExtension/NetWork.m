//
//  NetWork.m
//  hotShare
//
//  Created by aei on 4/5/16.
//
//

#import "NetWork.h"

@implementation NetWork

+(BOOL)isEnable
{
    //检测wifi状态
    CDVReachability * wifi = [CDVReachability reachabilityForLocalWiFi];
    //检测手机是否能上网
    CDVReachability * conn = [CDVReachability reachabilityForInternetConnection];
    //判断网络状态
    if ([wifi currentReachabilityStatus]!= NotReachable ||[conn currentReachabilityStatus] != NotReachable)
    {
        return YES;
    }
    else
    {
        return NO;
    }
}

@end
