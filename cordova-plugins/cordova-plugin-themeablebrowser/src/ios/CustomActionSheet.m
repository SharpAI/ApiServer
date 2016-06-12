//
//  CustomActionSheet.m
//  customShareView
//
//  Created by aei on 6/12/16.
//  Copyright © 2016 actiontec. All rights reserved.
//

#import "CustomActionSheet.h"

#define RGBCOLOR(r, g, b)       [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:1]
#define RGBACOLOR(r, g, b, a)   [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:(a)]
//获取设备的物理高度
#define ScreenHeight [UIScreen mainScreen].bounds.size.height
//获取设备的物理宽度
#define ScreenWidth [UIScreen mainScreen].bounds.size.width

@interface CustomActionSheet ()<UICollectionViewDataSource,UICollectionViewDelegate,UICollectionViewDelegateFlowLayout,UIGestureRecognizerDelegate>


@property (nonatomic , strong) UICollectionView *mainCollectionView;
@property (nonatomic , strong) NSArray *listData;
@property (nonatomic , strong) NSString * title;
@property (nonatomic , strong) UIView *customerView;

@end

@implementation CustomActionSheet

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/
-(id) initWithList:(NSArray *)list title:(NSString *)title{
    if (self = [super init]) {
        self.frame = CGRectMake(0, 0, ScreenWidth, ScreenHeight);
        self.backgroundColor = RGBACOLOR(160, 160, 160, 0);
        //1.初始化layout
        UICollectionViewFlowLayout *layout = [[UICollectionViewFlowLayout alloc] init];
        //设置collectionView滚动方向
        [layout setScrollDirection:UICollectionViewScrollDirectionVertical];
        //设置headerView的尺寸大小
        
        int flag = [list count]%3?[list count]/3 +1:[list count]/3;
        
        CGFloat height = 0;
        
        if ([title isEqualToString:@""]||!title) {
            layout.headerReferenceSize = CGSizeMake(ScreenWidth-20, 0);
            height = 94*flag+10*(flag+1);
        }
        else{
            layout.headerReferenceSize = CGSizeMake(ScreenWidth-20, 45);
            height = 94*flag+10*(flag+1);
        }
        //该方法也可以设置itemSize
        layout.itemSize =CGSizeMake(110, 150);
        
        //2.初始化collectionView
        
        _mainCollectionView = [[UICollectionView alloc] initWithFrame:CGRectMake(10, 0, ScreenWidth-20, height) collectionViewLayout:layout];
        
        //3.注册collectionViewCell
        //注意，此处的ReuseIdentifier 必须和 cellForItemAtIndexPath 方法中 一致 均为 cellId
        [_mainCollectionView registerClass:[MyCollectionViewCell class] forCellWithReuseIdentifier:@"cellId"];
        
        //注册headerView  此处的ReuseIdentifier 必须和 cellForItemAtIndexPath 方法中 一致  均为reusableView
        [_mainCollectionView registerClass:[UICollectionReusableView class] forSupplementaryViewOfKind:UICollectionElementKindSectionHeader withReuseIdentifier:@"reusableView"];
        
        //4.设置代理
        _mainCollectionView.delegate = self;
        _mainCollectionView.dataSource = self;
        _mainCollectionView.backgroundColor = [UIColor whiteColor];
        //_mainCollectionView.scrollEnabled = NO;
        _mainCollectionView.layer.cornerRadius = 10;
        
        UILabel *cancelLabel = [[UILabel alloc] initWithFrame:CGRectMake(10,CGRectGetHeight(_mainCollectionView.frame)+10, ScreenWidth-20, 44)];
        cancelLabel.layer.cornerRadius =10;
        cancelLabel.layer.backgroundColor = [UIColor whiteColor].CGColor;
        
        cancelLabel.text = @"取消";
        cancelLabel.textAlignment = NSTextAlignmentCenter;
        cancelLabel.textColor = [UIColor colorWithRed:30/255.0 green:144/255.0  blue:255/255.0 alpha:1];
        UITapGestureRecognizer *tapRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(tappedCancel)];
        cancelLabel.userInteractionEnabled = YES;
        [cancelLabel addGestureRecognizer:tapRecognizer];
        
        _customerView = [[UIView alloc] initWithFrame:CGRectMake(0, ScreenHeight, ScreenWidth, CGRectGetHeight(_mainCollectionView.frame)+60)];
        _customerView.backgroundColor = [UIColor clearColor];
        [_customerView addSubview:_mainCollectionView];
        [_customerView addSubview:cancelLabel];
        
        [self addSubview:_customerView];
        
        
        _listData = list;
        _title = title;
        
    }
    return self;
}

-(BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldReceiveTouch:(UITouch *)touch{
    if([touch.view isKindOfClass:[self class]]){
        return YES;
    }
    return NO;
}

-(void)animeData{
    UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(tappedCancel)];
    tapGesture.delegate = self;
    [self addGestureRecognizer:tapGesture];
    self.userInteractionEnabled = YES;
    
    [UIView animateWithDuration:0.25f animations:^{
        self.backgroundColor = RGBACOLOR(160, 160, 160, 0.4);
        CGRect originRect = _customerView.frame;
        originRect.origin.y = ScreenHeight - CGRectGetHeight(_customerView.frame);
        _customerView.frame = originRect;
    } completion:^(BOOL finished) {
        
    }];
}

-(void) tappedCancel{
    [UIView animateWithDuration:.25 animations:^{
        self.alpha = 0;
        CGRect originRect = _customerView.frame;
        originRect.origin.y = ScreenHeight;
        _customerView.frame = originRect;
    } completion:^(BOOL finished) {
        if (finished) {
            for (UIView *v in _customerView.subviews) {
                [v removeFromSuperview];
            }
            [_customerView removeFromSuperview];
        }
    }];
}

- (void)  showInView:(UIViewController *)controller{
    if (controller) {
        [controller.view addSubview:self];
    }else{
        [[UIApplication sharedApplication].delegate.window.rootViewController.view addSubview:self];
    }
    [self animeData];
}

#pragma mark collectionView代理方法
//返回section个数
- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView
{
    return 1;
}

//每个section的item个数
- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section
{
    return [_listData count];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath
{
    
    MyCollectionViewCell *cell = (MyCollectionViewCell *)[collectionView dequeueReusableCellWithReuseIdentifier:@"cellId" forIndexPath:indexPath];

    [cell setData:[_listData objectAtIndex:indexPath.row]];
    return cell;
}

//设置每个item的尺寸
- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath
{
    return CGSizeMake(74, 94);
}

//footer的size
//- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout referenceSizeForFooterInSection:(NSInteger)section
//{
//    return CGSizeMake(10, 10);
//}

//header的size
//- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout referenceSizeForHeaderInSection:(NSInteger)section
//{
//    return CGSizeMake(10, 10);
//}

//设置每个item的UIEdgeInsets
- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout insetForSectionAtIndex:(NSInteger)section
{
    return UIEdgeInsetsMake(10, 10, 10, 10);
}

//设置每个item水平间距
- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout minimumInteritemSpacingForSectionAtIndex:(NSInteger)section
{
    return (ScreenWidth-20-74*3)/6;
}


//设置每个item垂直间距
- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout minimumLineSpacingForSectionAtIndex:(NSInteger)section
{
    return 10;
}


//通过设置SupplementaryViewOfKind 来设置头部或者底部的view，其中 ReuseIdentifier 的值必须和 注册是填写的一致，本例都为 “reusableView”
- (UICollectionReusableView *)collectionView:(UICollectionView *)collectionView viewForSupplementaryElementOfKind:(NSString *)kind atIndexPath:(NSIndexPath *)indexPath
{
    UICollectionReusableView *headerView = [collectionView dequeueReusableSupplementaryViewOfKind:UICollectionElementKindSectionHeader withReuseIdentifier:@"reusableView" forIndexPath:indexPath];
    headerView.backgroundColor =[UIColor lightTextColor];
    UILabel *label = [[UILabel alloc] initWithFrame:headerView.bounds];
    label.text = _title;
    label.textAlignment = NSTextAlignmentCenter;
    label.font = [UIFont systemFontOfSize:14];
    [headerView addSubview:label];
    return headerView;
}

//点击item方法
- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath
{
    [self tappedCancel];
    if (_delegate != nil && [_delegate respondsToSelector:@selector(didSelectIndex:)]) {
        [_delegate didSelectIndex:indexPath.row];
        return;
    }
}


/*
 #pragma mark - Navigation
 
 // In a storyboard-based application, you will often want to do a little preparation before navigation
 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
 // Get the new view controller using [segue destinationViewController].
 // Pass the selected object to the new view controller.
 }
 */


@end

@interface MyCollectionViewCell()

@property (strong, nonatomic) UIImageView *image;
@property (strong, nonatomic) UILabel *label;
@property (nonatomic , strong) Item  *item;

@end

@implementation MyCollectionViewCell

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self)
    {
        _image  = [[UIImageView alloc] initWithFrame:CGRectMake(5, 0, 64, 64)];
        //_image.backgroundColor = [UIColor redColor];
        [self.contentView addSubview:_image];
        
        _label = [[UILabel alloc] initWithFrame:CGRectMake(0, 70, 74, 20)];
        _label.textAlignment = NSTextAlignmentCenter;
        //_label.textColor = [UIColor blueColor];
        _label.font = [UIFont systemFontOfSize:13];
        _label.backgroundColor = [UIColor clearColor];
        [self.contentView addSubview:_label];
    }
    
    return self;
}

//设置数据
-(void)setData:(Item *)item{
    _item = item;
    _image.image = [UIImage imageNamed:item.icon];
    _label.text = item.title;
}


@end

@implementation Item


@end
