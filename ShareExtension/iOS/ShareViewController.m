//
//  ShareViewController.m
//  shareEx
//
//  Created by aei on 5/19/16.
//  Copyright © 2016 actiontec. All rights reserved.
//

#import "ShareViewController.h"
#import "PromptViewController.h"
#import "MBProgressHUD.h"
#import "RealReachability/RealReachability.h"

#define API_URL @"http://host1.tiegushi.com"
#define NUMBER_OF_CHARS 10

#define CORNER_RADIUS 10
#define BG_WIDTH 360
#define BG_HEIGHT 100

#define CANCEL_BTN_HEIGHT 50


#define PROGRESS_HEIGHT 8

#define TITLE_FONT_SIZE 16
#define CONTENT_FONT_SIZE 12

#define  TEXT_BLACK_COLOR ([UIColor colorWithRed:41/255.0 green:41/255.0 blue:41/255.0 alpha:1])

#define BTN_LIGHTGREEN_COLOR ([UIColor colorWithRed:37/255.0 green:171/255.0 blue:236/255.0 alpha:1])

#define LINE_GRAY_COLOR ([UIColor colorWithRed:227/255.0 green:226/255.0 blue:229/255.0 alpha:1])

#define  STATUS_FAILED @"failed"
#define  STATUS_SUCCESS @"succ"
#define  STATUS_IMPORTING @"importing"


@interface ShareViewController ()<MBProgressHUDDelegate>

{
    NSString *userId;
    NSString *entensionTitle;
    NSString *entensionURL;
    NSMutableDictionary *extensionItem;
    NSMutableArray *imagesAry;
    NSFileManager* fileMgr;
    NSString* filePath;
    NSString* docsPath;
    UIImageOrientation orientation;
    CGSize targetSize;
    NSInteger quality;
    NSInteger count;
    
    NSString *taskId;
}
@property (strong, nonatomic)NSUserDefaults *mySharedDefults;

@property (strong, nonatomic)UIView *bgView;

@property (strong, nonatomic)MBProgressHUD *progressView;

@property (strong, nonatomic)UIButton *cancelBtn;
@property (strong, nonatomic)UILabel *titleLbl;

@property (atomic, assign) BOOL canceled;
@property (atomic, assign) BOOL isImporting;

@property (strong,nonatomic) NSString *status;

@property(strong ,nonatomic)PromptViewController *promptView;

@property (assign ,nonatomic)ReachabilityStatus *reachabilityStatus;
//@property (nonatomic ,strong)dispatch_source_t timer;

@end



@implementation ShareViewController

- (BOOL)isContentValid {
    // Do validation of contentText and/or NSExtensionContext attachments here
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    //数据共享
    if (!_mySharedDefults) {
        
        _mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
        
    }
    
    userId = [_mySharedDefults objectForKey:@"userId"];
    
    if (!userId || [userId isEqualToString:@""]) {
        
        //提示框
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"故事贴" message:@"抱歉，请先打开故事贴，并登录，才可以使用分享功能。" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
            
        }];
        
        [alertController addAction:okAction];
        
        [self presentViewController:alertController animated:YES completion:nil];
        
    }
    else{
        
        [GLobalRealReachability startNotifier];
        
        extensionItem = [[NSMutableDictionary alloc] init];
        
        ReachabilityStatus status = [GLobalRealReachability currentReachabilityStatus];
        NSLog(@"Initial reachability status:%@",@(status));
        
        if (status == RealStatusNotReachable)
        {
            UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"故事贴" message:@"世界上最遥远的距离就是没网，请检查您的网络配置。" preferredStyle:UIAlertControllerStyleAlert];
            
            UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
                
                [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
                
            }];
            
            [alertController addAction:okAction];
            
            [self presentViewController:alertController animated:YES completion:nil];
            
            return;
            
        }
        
        [self fetchItemDataAtBackground];
        
        [self customSubView];
        
    }
    
}


-(void)customSubView{
    
    self.view.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.3];
    
    _bgView = [[UIView alloc] init];
    
    _bgView.backgroundColor = [UIColor whiteColor];
    
    _bgView.layer.cornerRadius = CORNER_RADIUS;
    
    _bgView.layer.masksToBounds = true;
    
    [self.view addSubview:_bgView];
    //使用Auto Layout约束，禁止将Autoresizing Mask转换为约束
    [_bgView setTranslatesAutoresizingMaskIntoConstraints:NO];
    
    NSLayoutConstraint *bgcontraintcenterx = [NSLayoutConstraint constraintWithItem:_bgView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0.0];
    
    NSLayoutConstraint *bgcontraintwidth = [NSLayoutConstraint constraintWithItem:_bgView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeWidth multiplier:1.0 constant:BG_WIDTH];
    
    NSLayoutConstraint *bgcontraintbottom = [NSLayoutConstraint constraintWithItem:_bgView attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeBottom multiplier:1.0 constant:-CANCEL_BTN_HEIGHT-20];
    
    NSLayoutConstraint *bgcontraintcenterheight = [NSLayoutConstraint constraintWithItem:_bgView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:BG_HEIGHT];
    //把约束添加到父视图上
    NSArray *bgarray = @[bgcontraintcenterx, bgcontraintwidth, bgcontraintbottom, bgcontraintcenterheight];
    [self.view addConstraints:bgarray];
    
    
    _titleLbl = [[UILabel alloc] init];
    
    _titleLbl.text = @"正在发送";
    
    _titleLbl.textAlignment = NSTextAlignmentCenter;
    
    _titleLbl.adjustsFontSizeToFitWidth = YES;
    
    _titleLbl.font = [UIFont boldSystemFontOfSize:TITLE_FONT_SIZE];
    
    _titleLbl.textColor = TEXT_BLACK_COLOR;
    
    [_bgView addSubview:_titleLbl];
    //使用Auto Layout约束，禁止将Autoresizing Mask转换为约束
    [_titleLbl setTranslatesAutoresizingMaskIntoConstraints:NO];
    
    NSLayoutConstraint *titleLblcontraintcenterx = [NSLayoutConstraint constraintWithItem:_titleLbl attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:_bgView attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0.0];
    
    NSLayoutConstraint *titleLblcontraintwidth = [NSLayoutConstraint constraintWithItem:_titleLbl attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeWidth multiplier:1.0 constant:100.0];
    
    NSLayoutConstraint *titleLblcontraintop = [NSLayoutConstraint constraintWithItem:_titleLbl attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:_bgView attribute:NSLayoutAttributeTop multiplier:1.0 constant:0.0];
    
    NSLayoutConstraint *titleLblcontraintheight = [NSLayoutConstraint constraintWithItem:_titleLbl attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:_bgView attribute:NSLayoutAttributeHeight multiplier:0.33 constant:0.0];
    //把约束添加到父视图上
    NSArray *titleLblarray = @[titleLblcontraintcenterx, titleLblcontraintwidth, titleLblcontraintop, titleLblcontraintheight];
    [_bgView addConstraints:titleLblarray];
    
    
    
    _cancelBtn = [[UIButton alloc] init];
    
    [_cancelBtn setBackgroundColor:[UIColor whiteColor]];
    
    _cancelBtn.layer.cornerRadius = CORNER_RADIUS;
    
    _cancelBtn.layer.masksToBounds = true;
    
    [_cancelBtn setTitle:@"取消发送" forState:UIControlStateNormal];
    
    _cancelBtn.titleLabel.font = [UIFont boldSystemFontOfSize:TITLE_FONT_SIZE];
    
    [_cancelBtn setTitleColor:BTN_LIGHTGREEN_COLOR forState:UIControlStateNormal];
    
    [_cancelBtn addTarget:self action:@selector(cancelButtonTapped:) forControlEvents:UIControlEventTouchUpInside];
    
    [self.view addSubview:_cancelBtn];
    
    [_cancelBtn setTranslatesAutoresizingMaskIntoConstraints:NO];
    
    NSLayoutConstraint *cancelBtncontraintcenterx = [NSLayoutConstraint constraintWithItem:_cancelBtn attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0.0];
    
    NSLayoutConstraint *cancelBtncontrainwidth = [NSLayoutConstraint constraintWithItem:_cancelBtn attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:BG_WIDTH];
    
    NSLayoutConstraint *cancelBtncontrainbottom = [NSLayoutConstraint constraintWithItem:_cancelBtn attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.view attribute:NSLayoutAttributeBottom multiplier:1.0 constant:-10.0];
    
    NSLayoutConstraint *cancelBtncontrainheight = [NSLayoutConstraint constraintWithItem:_cancelBtn attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:CANCEL_BTN_HEIGHT];
    //把约束添加到父视图上
    NSArray *cancelBtnarray = @[cancelBtncontraintcenterx, cancelBtncontrainwidth, cancelBtncontrainbottom, cancelBtncontrainheight];
    [self.view addConstraints:cancelBtnarray];
    
    
//    UIView *lineView = [[UIView alloc] init];
//    
//    lineView.backgroundColor = LINE_GRAY_COLOR;
//    
//    [_bgView addSubview:lineView];
//    
//    [lineView setTranslatesAutoresizingMaskIntoConstraints:NO];
//    
//    NSLayoutConstraint *linecontraintcenterx = [NSLayoutConstraint constraintWithItem:lineView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:_bgView attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0.0];
//    
//    NSLayoutConstraint *linecontrainwidth = [NSLayoutConstraint constraintWithItem:lineView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:_bgView attribute:NSLayoutAttributeWidth multiplier:1.0 constant:0.0];
//    
//    NSLayoutConstraint *linecontrainbottom = [NSLayoutConstraint constraintWithItem:lineView attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:_cancelBtn attribute:NSLayoutAttributeTop multiplier:1.0 constant:0.0];
//    
//    NSLayoutConstraint *linecontrainheight = [NSLayoutConstraint constraintWithItem:lineView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeHeight multiplier:1.0 constant:1.0];
//    //把约束添加到父视图上
//    NSArray *linearray = @[linecontraintcenterx, linecontrainwidth, linecontrainbottom, linecontrainheight];
//    [_bgView addConstraints:linearray];
    
    
    _progressView = [MBProgressHUD showHUDAddedTo:_bgView animated:YES];
    
    _progressView.bezelView.backgroundColor = [UIColor clearColor];
    
    _progressView.contentColor = LINE_GRAY_COLOR;

    _progressView.mode = MBProgressHUDModeDeterminateHorizontalBar;
    
    if ([_progressView.indicator isKindOfClass:[MBBarProgressView class]]) {
        ((MBBarProgressView *)_progressView.indicator).progressColor = BTN_LIGHTGREEN_COLOR;
        //((MBBarProgressView *)_progressView.indicator).lineColor = color;
    }
    
    _progressView.label.text = @"";
    
    _progressView.offset = CGPointMake(0.f, 10.f);
    
    _progressView.delegate = self;
    
    [_bgView sendSubviewToBack:_progressView];
    
}

-(void)doSomeWorkWithProgress{
    
    self.canceled = NO;
    
    float progress = 0.0f;
    while (progress < 1.0f) {
        if (self.canceled) break;
        
        if ([self.status isEqualToString:STATUS_FAILED]) {
            break;
        }
        if ([self.status isEqualToString:STATUS_SUCCESS] || progress < 0.8f ) {
            
            progress += 0.01f;
        }
        dispatch_async(dispatch_get_main_queue(), ^{
            
            NSLog(@"progress:%f",progress);
           
            _progressView.progress = progress;
            
        });
        if ([self.status isEqualToString:STATUS_SUCCESS]) {
            usleep(500);
        }
        else{
            usleep(500000);
        }
    }
    if ([self.status isEqualToString:STATUS_FAILED]) {
       
        [self showPromptViewWithType:@"url"];
    }
    if ([self.status isEqualToString:STATUS_SUCCESS]) {
        
        [self showPromptViewWithType:@"url"];
    }
}


- (void)cancelButtonTapped:(id)sender {
    
    self.canceled = YES;
    
    if (_isImporting) {
        
        [self cancelImport];
        
        return;
    }
    [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
}


-(void)postDataToImportServer{
    
    _isImporting = true;
    
    self.status = STATUS_IMPORTING;
    
    NSCharacterSet *URLCombinedCharacterSet = [[NSCharacterSet characterSetWithCharactersInString:@" \"#%/:<>?@[\\]^`{|}"] invertedSet];
    
    NSString *entensionEncodeURL =  [entensionURL stringByAddingPercentEncodingWithAllowedCharacters:URLCombinedCharacterSet];
    
    taskId = [self randomString];
    
    NSString *urlStr = [NSString stringWithFormat:@"%@/import-server/%@/%@?task_id=%@",API_URL,userId,entensionEncodeURL,taskId];
    
    NSURL *url = [NSURL URLWithString:urlStr];
    NSLog(@"url is:%@",url);
    
    NSURLRequest *request = [NSURLRequest requestWithURL:url];

    
    NSURLSession *session = [NSURLSession sharedSession];
    
    NSURLSessionDataTask * dataTask =  [session dataTaskWithRequest:request completionHandler:^(NSData * __nullable data, NSURLResponse * __nullable response, NSError * __nullable error) {
        
        NSString *result = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
        
        NSArray *resAry = [result componentsSeparatedByString:@"\r\n"];
        
        NSString *reResultStr = resAry.lastObject;
        
        NSData *reResultData = [reResultStr dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary *reResult = [NSJSONSerialization JSONObjectWithData:reResultData options:0 error:nil];
        
        if (reResult) {
            NSString *status = reResult[@"status"];
            NSLog(@"%@\n",status);
            
            self.status = status;
            
            _isImporting = NO;
            
        }
        if (error) {
            NSLog(@"导入失败！原因：%@",[error localizedDescription]);
            self.status = STATUS_FAILED;
        }
        
    }];
    [dataTask resume];
    
    [self doSomeWorkWithProgress];
    
}

-(NSString *)randomString{
    char data[NUMBER_OF_CHARS];
    for (int x=0;x<NUMBER_OF_CHARS;data[x++] = (char)('A' + (arc4random_uniform(26))));
    return [[NSString alloc] initWithBytes:data length:NUMBER_OF_CHARS encoding:NSUTF8StringEncoding];
}


-(void)fetchItemDataAtBackground{
    
    //后台获取
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSArray *inputItems = self.extensionContext.inputItems;
        NSExtensionItem *item = inputItems.firstObject;//无论多少数据，实际上只有一个 NSExtensionItem 对象
        count = item.attachments.count;
        for (NSItemProvider *provider in item.attachments) {
            //completionHandler 是异步运行的
            NSString *dataType = provider.registeredTypeIdentifiers.firstObject;//实际上一个NSItemProvider里也只有一种数据类型
            if ([dataType isEqualToString:@"public.png"]) {
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(UIImage *image, NSError *error){
                    //collect image...
                    
                    [self getImagePath:image];
                    
                    
                }];
            }else if ([dataType isEqualToString:@"public.jpeg"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(UIImage *image, NSError *error){
                    //collect image...
                    [self getImagePath:image];
                    
                }];
            }
            else if ([dataType isEqualToString:@"public.image"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(UIImage *image, NSError *error){
                    //collect image...
                    [self getImagePath:image];
                    
                }];
            }
            else if ([dataType isEqualToString:@"public.plain-text"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSString *contentText, NSError *error){
                    //collect image...
                    
                }];
            }else if ([dataType isEqualToString:@"public.url"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSURL *url, NSError *error){
                    //collect url...
                    if (error) {
                        NSLog(@"ERROR: %@", error);
                    }
                    
                    entensionURL = [url absoluteString];
                    
                    NSLog(@"entensionURL:%@", entensionURL);
                    
                    [self postDataToImportServer];
                    
                    
                }];
            }else
                NSLog(@"don't support data type: %@", dataType);
        }
    });
    
}



-(void)getImagePath:(UIImage *)image{
    int i;
    NSError* err = nil;
    if (!imagesAry) {
        imagesAry = [NSMutableArray new];
        fileMgr = [NSFileManager defaultManager];
        
        NSURL *containerURL = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:@"group.org.hotsharetest"];
        //docsPath  = [NSHomeDirectory()stringByAppendingPathComponent:@"Documents/"];
        docsPath = [[containerURL path] stringByAppendingPathComponent:@"Documents"];
        [fileMgr createDirectoryAtPath:docsPath withIntermediateDirectories:YES attributes:nil error:nil];
        orientation = UIImageOrientationUp;
        targetSize = CGSizeMake(1900, 1900);
        i = 1;
        quality = 20;
    }
    do {
        
        
        NSString *fileName = [NSString stringWithFormat:@"%@%03d.%@", @"cdv_photo_", i++, @"jpg"];
        filePath =[docsPath stringByAppendingPathComponent:fileName];
        
    } while ([fileMgr fileExistsAtPath:filePath]);
    
    UIImage* scaledImage = [self imageByScalingNotCroppingForSize:image toSize:targetSize];
    NSData* data = UIImageJPEGRepresentation(scaledImage, quality/100.0f);
    //[data writeToFile:filePath options:NSDataWritingAtomic error:nil];
    
    NSLog(@"filePath:%@",filePath);
    if (![data writeToFile:filePath options:NSDataWritingAtomic error:&err]) {
        
        NSLog(@"error:%@",[err localizedDescription]);
        
    } else {
        [imagesAry addObject:[[NSURL fileURLWithPath:filePath] absoluteString]];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            
            float progress = imagesAry.count/count;
            
            //_progressContentWidth.constant = _progressBgWidth.constant*progress;
            _progressView.progress = progress;
            
        });
    }
    
    if (imagesAry.count == count) {
        
        [extensionItem setObject:@"image" forKey:@"type"];
        
        [extensionItem setObject:imagesAry forKey:@"content"];
        
        NSMutableArray  *ary =[NSMutableArray arrayWithArray:[self.mySharedDefults objectForKey:@"shareExtensionItems"]];
        
        if (!ary) {
            
            ary  = [[NSMutableArray alloc] init];
        }
        
        [ary addObject:extensionItem];
        
        
        [self.mySharedDefults setObject:ary forKey:@"shareExtensionItems"];
        
        [self.mySharedDefults synchronize];
        
        [self showPromptViewWithType:@"image"];
        
    }
    
}

- (UIImage*)imageByScalingNotCroppingForSize:(UIImage*)anImage toSize:(CGSize)frameSize
{
    UIImage* sourceImage = anImage;
    UIImage* newImage = nil;
    CGSize imageSize = sourceImage.size;
    CGFloat width = imageSize.width;
    CGFloat height = imageSize.height;
    CGFloat targetWidth = frameSize.width;
    CGFloat targetHeight = frameSize.height;
    CGFloat scaleFactor = 0.0;
    CGSize scaledSize = frameSize;
    
    if (CGSizeEqualToSize(imageSize, frameSize) == NO) {
        CGFloat widthFactor = targetWidth / width;
        CGFloat heightFactor = targetHeight / height;
        
        // opposite comparison to imageByScalingAndCroppingForSize in order to contain the image within the given bounds
        if (widthFactor == 0.0) {
            scaleFactor = heightFactor;
        } else if (heightFactor == 0.0) {
            scaleFactor = widthFactor;
        } else if (widthFactor > heightFactor) {
            scaleFactor = heightFactor; // scale to fit height
        } else {
            scaleFactor = widthFactor; // scale to fit width
        }
        scaledSize = CGSizeMake(width * scaleFactor, height * scaleFactor);
    }
    
    UIGraphicsBeginImageContext(scaledSize); // this will resize
    
    [sourceImage drawInRect:CGRectMake(0, 0, scaledSize.width, scaledSize.height)];
    
    newImage = UIGraphicsGetImageFromCurrentImageContext();
    if (newImage == nil) {
        NSLog(@"could not scale image");
    }
    
    // pop the context to get back to the default
    UIGraphicsEndImageContext();
    return newImage;
}

-(void)cancelImport{
    
    if (!taskId) {
        
        return [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];;
    }
    
    NSString *urlStr = [NSString stringWithFormat:@"%@/import-cancel/%@",API_URL,taskId];
    
    NSURL *url = [NSURL URLWithString:urlStr];
    NSLog(@"url is:%@",url);
    
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    
    
    NSURLSession *session = [NSURLSession sharedSession];
    
    NSURLSessionDataTask * dataTask =  [session dataTaskWithRequest:request completionHandler:^(NSData * __nullable data, NSURLResponse * __nullable response, NSError * __nullable error) {
        
        if (error) {
           return  NSLog(@"取消失败！原因：%@",[error localizedDescription]);
        }
        
    }];
    [dataTask resume];
    dispatch_async(dispatch_get_main_queue(), ^{
        
         [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
        
    });
}

-(void)showPromptViewWithType:(NSString *)type{
    
    if (!self.promptView) {
        
        self.promptView = [[PromptViewController alloc] init];
        
        __block ShareViewController *responder = self;
        
        self.promptView.block=^(){
            
            [responder.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
        };
    }
    
    self.promptView.status = _status;
    
    self.promptView.type = type;
    
    dispatch_async(dispatch_get_main_queue(), ^{
        
       [self presentViewController:self.promptView animated:NO completion:nil];
        
    });
    
}

- (void)didSelectPost {
    // This is called after the user selects Post. Do the upload of contentText and/or NSExtensionContext attachments.
    
    // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
    [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
}

- (NSArray *)configurationItems {
    // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
    return @[];
}

@end

