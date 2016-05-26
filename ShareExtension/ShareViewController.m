//
//  ShareViewController.m
//  shareEx
//
//  Created by aei on 5/19/16.
//  Copyright © 2016 actiontec. All rights reserved.
//

#import "ShareViewController.h"
#import "PromptViewController.h"
#import "TFHpple.h"
@interface ShareViewController ()

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
    UIBarButtonItem *saveBarButtonItem;
}
@property (strong, nonatomic)NSUserDefaults *mySharedDefults;
@property (strong, nonatomic) UINavigationBar *customNavBar;
@property (strong, nonatomic)PromptViewController* promptViewController;

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
        
        extensionItem = [[NSMutableDictionary alloc] init];
        
    }
    
}

-(void) viewWillAppear:(BOOL)animated
{
    
    [super viewWillAppear:animated];
    
    if (!self.customNavBar) {
        
        self.customNavBar = [[UINavigationBar alloc] init];
        
        [self setCancelSaveNavigationItem];
        
        [self.navigationController.navigationBar removeFromSuperview];
        
        [self.navigationController.view addSubview:self.customNavBar];
        //使用Auto Layout约束，禁止将Autoresizing Mask转换为约束
        [self.customNavBar setTranslatesAutoresizingMaskIntoConstraints:NO];
        
        NSLayoutConstraint *contraint1 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeTop multiplier:1.0 constant:0.0];
        
        NSLayoutConstraint *contraint2 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0.0];
        
        NSLayoutConstraint *contraint3 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.textView attribute:NSLayoutAttributeTop multiplier:1.0 constant:0.0];
        
        NSLayoutConstraint *contraint4 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeRight multiplier:1.0 constant:0.0];
        //把约束添加到父视图上
        NSArray *array = @[contraint1, contraint2, contraint3, contraint4];
        [self.navigationController.view addConstraints:array];
        
    }
    
    //self.textView.editable = NO;
    
    [self fetchItemDataAtBackground];
    
}


-(void)setCancelSaveNavigationItem
{
    UINavigationItem *newItem = [[UINavigationItem alloc] init];
    UIBarButtonItem *cancelBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"取消",nil)  style:UIBarButtonItemStylePlain target:self action:@selector(cancelButtonTapped:)];
    saveBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"保存",nil)  style:UIBarButtonItemStyleDone target:self action:@selector(saveButtonTapped:)];
    newItem.leftBarButtonItem = cancelBarButtonItem;
    newItem.rightBarButtonItem = saveBarButtonItem;
    newItem.title = @"故事贴";
    [self.customNavBar setItems:@[newItem]];
    [self.navigationItem setBackBarButtonItem:cancelBarButtonItem];
    [self.navigationItem setRightBarButtonItem:saveBarButtonItem];
    saveBarButtonItem.enabled = false;
    
}
- (void)cancelButtonTapped:(id)sender {
    [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
}

- (void)saveButtonTapped:(id)sender {
    
    NSMutableArray  *ary =[NSMutableArray arrayWithArray:[self.mySharedDefults objectForKey:@"shareExtensionItems"]];
    
    if (!ary) {
        
        ary  = [[NSMutableArray alloc] init];
    }
    [extensionItem setObject:self.textView.text forKey:@"text"];
    
    [ary addObject:extensionItem];
    
    [self.mySharedDefults setObject:ary forKey:@"shareExtensionItems"];
    
    [self.mySharedDefults synchronize];
    
    [self showDialog];
    
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
                    
                    [extensionItem setObject:@"url" forKey:@"type"];
                    
                    NSArray *ary = @[entensionURL];
                    
                    [extensionItem setObject:ary forKey:@"content"];
                    
                    [self parserHTML:url];
                    
                    
                }];
            }else
                NSLog(@"don't support data type: %@", dataType);
        }
    });
    
}

-(void)parserHTML:(NSURL *)url{
    
    
    NSData *data = [[NSData alloc] initWithContentsOfURL:url];
    TFHpple *xpathParser = [[TFHpple alloc] initWithHTMLData:data];
    NSArray *elements  = [xpathParser searchWithXPathQuery:@"//title"];
    TFHppleElement *element = [elements objectAtIndex:0];
    NSString *content = [element content];
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if ([self.textView.text isEqualToString:@""]) {
            
            self.textView.text = content;
        }
        
    });
    NSArray *imagesArry  = [xpathParser searchWithXPathQuery:@"//img"];
    
    if (imagesArry) {
        
        TFHppleElement *element2 = [imagesArry objectAtIndex:0];
        NSDictionary *elementContent = [element2 attributes];
        NSString *imageUrl = [elementContent objectForKey:@"src"];
        NSLog(@"imageUrl:%@",imageUrl);
        [extensionItem setObject:imageUrl forKey:@"imageUrl"];
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        
        saveBarButtonItem.enabled = true;
        
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
    }
    
    if (imagesAry.count == count) {
        
        dispatch_async(dispatch_get_main_queue(), ^{
            
            saveBarButtonItem.enabled = true;
            
        });
        
        [extensionItem setObject:@"image" forKey:@"type"];
        
        [extensionItem setObject:imagesAry forKey:@"content"];
        
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


-(void)showDialog{
    
    if(!self.promptViewController){
        
        self.promptViewController = [[PromptViewController alloc] init];
        
        __block ShareViewController *responder = self;
        
        self.promptViewController.block=^(){
            
            [responder.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
        };
    }
    
    [self presentViewController:self.promptViewController animated:NO completion:nil];
    
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

