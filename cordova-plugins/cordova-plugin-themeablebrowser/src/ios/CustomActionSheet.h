//
//  CustomActionSheet.h
//  customShareView
//
//  Created by aei on 6/12/16.
//  Copyright © 2016 actiontec. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol DownSheetDelegate <NSObject>

-(void)didSelectIndex : (NSInteger) index;

@end


@interface Item : NSObject

@property (nonatomic , strong) NSString *icon;//图片地址

@property (nonatomic , strong) NSString *title;//标题

@end



@interface CustomActionSheet : UIView

@property (nonatomic , strong) id<DownSheetDelegate> delegate;

-(id)initWithList : (NSArray *)list title : (NSString *) title;

-(void) showInView : (UIViewController *)controller;

@end



@interface MyCollectionViewCell : UICollectionViewCell

-(void)setData : (Item *)item;

@end