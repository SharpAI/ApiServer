Meteor.startup(function(){
//创建Follows推荐列表数据库
//如果数据中没有记录，创建用户，然后加到推荐列表数据库Follows中
//这样可以加快拉出推荐列表的速度。
    if(Follows.find().count() === 0){
//创建偶像用户1
       followerId = Accounts.createUser({
           username:'Chase',
           password:'actiontec123',
           email:'ChaseJarvis@ggmail.com',
           profile:{
               icon:'/follows/icon1.png',
               fullname:'伊人'
           }
       });
//加入偶像推荐列表
       Follows.insert({
           icon:'/follows/icon1.png',
           userId:followerId,
           username:'Chase',
           fullname:'伊人',
           desc:"留下美好的瞬间！就看我的！",
           share1:'/follows/11.jpg',
           share2:'/follows/12.jpg',
           share3:'/follows/13.jpg'
       });
//加偶像的3个Post
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/112.jpg'},{isImage:false,text:'秋水共长天一色'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/113.jpg'},{isImage:false,text:'夕阳无限好'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/114.jpg'},{isImage:false,text:'只是近黄昏'}],
          title:'落霞与孤鹜齐飞',
          addontitle:'秋水共长天一色',
          mainImage: 'http://www.ss750.cn/follows/111.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'伊人',
          ownerIcon:'/follows/icon1.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/122.jpg'},{isImage:false,text:'心里开出一朵花'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/123.jpg'},{isImage:false,text:'爱让我们相恋'}],
          title:'因为爱情',
          addontitle:'义无反顾',
          mainImage: 'http://www.ss750.cn/follows/121.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'伊人',
          ownerIcon:'/follows/icon1.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/132.jpg'},{isImage:false,text:'曾经我们手牵着手'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/133.jpg'},{isImage:false,text:'你说要我等你回来'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/134.jpg'},{isImage:false,text:'亲爱的，你在哪里'}],
          title:'十年',
          addontitle:'我等得花儿都谢了',
          mainImage: 'http://www.ss750.cn/follows/131.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'伊人',
          ownerIcon:'/follows/icon1.png',
          createdAt: new Date(),
          layout: '[]'
       });
//创建偶像用户2
       followerId = Accounts.createUser({
           username:'Rocco',
           password:'actiontec123',
           email:'RoccoDispirito@ggmail.com',
           profile:{
               icon:'/follows/icon2.png',
               fullname:'文亭'
           }
       });
       Follows.insert({
           icon:'/follows/icon2.png',
           userId:followerId,
           username:'Rocco',
           fullname:'文亭',
           desc:"喜欢上了摄影，于是改变了自己的生活。",
           share1:'/follows/21.jpg',
           share2:'/follows/22.jpg',
           share3:'/follows/23.jpg'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/212.jpg'},{isImage:false,text:'冬日原野'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/213.jpg'},{isImage:false,text:'星星之火'}],
          title:'冬季',
          addontitle:'我想大约会是在冬季',
          mainImage: 'http://www.ss750.cn/follows/211.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'文亭',
          ownerIcon:'/follows/icon2.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/222.jpg'},{isImage:false,text:'katharine ross there the list'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/223.jpg'},{isImage:false,text:'Butch cassidy and the sundance kid'}],
          title:'Raindrops Keep Falling On My Head',
          addontitle:'Butch cassidy and the sundance kid',
          mainImage: 'http://www.ss750.cn/follows/221.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'文亭',
          ownerIcon:'/follows/icon2.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/232.jpg'},{isImage:false,text:'无论在冰天雪地'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/233.jpg'},{isImage:false,text:'还是明朗天空'}],
          title:'我一直在等待',
          addontitle:'一个女孩',
          mainImage: 'http://www.ss750.cn/follows/231.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'文亭',
          ownerIcon:'/follows/icon2.png',
          createdAt: new Date(),
          layout: '[]'
       });
//创建偶像用户3
       followerId = Accounts.createUser({
           username:'Matt',
           password:'actiontec123',
           email:'MattCrump@ggmail.com',
           profile:{
               icon:'/follows/icon3.png',
               fullname:'秋雨梧桐'
           }
       });
       Follows.insert({
           icon:'/follows/icon3.png',
           userId:followerId,
           username:'Matt',
           fullname:'秋雨梧桐',
           desc:"在感受中－－拍摄； 在拍摄中----感悟------",
           share1:'/follows/31.jpg',
           share2:'/follows/32.jpg',
           share3:'/follows/33.jpg'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/312.jpg'},{isImage:false,text:"Don't be sad"},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/313.jpg'},{isImage:false,text:'You should smile like a flower'}],
          title:'And I love you so',
          addontitle:'girl',
          mainImage: 'http://www.ss750.cn/follows/311.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'秋雨梧桐',
          ownerIcon:'/follows/icon3.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/322.jpg'},{isImage:false,text:'Life goes easy on me'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/323.jpg'},{isImage:false,text:'Cannot take my eyes off you'}],
          title:'A Whiter Shade Of Pale',
          addontitle:'Just like you said it should be',
          mainImage: 'http://www.ss750.cn/follows/321.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'秋雨梧桐',
          ownerIcon:'/follows/icon3.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/332.jpg'},{isImage:false,text:'怎么可能喜欢孤独，不过是不乱交朋友罢了'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/333.jpg'},{isImage:false,text:'一个人也很好'}],
          title:'孤独的人',
          addontitle:'是可耻的',
          mainImage: 'http://www.ss750.cn/follows/331.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'秋雨梧桐',
          ownerIcon:'/follows/icon3.png',
          createdAt: new Date(),
          layout: '[]'
       });
//创建偶像用户4
       followerId = Accounts.createUser({
           username:'Veronica',
           password:'actiontec123',
           email:'VeronicaBelmont@ggmail.com',
           profile:{
               icon:'/follows/icon4.png',
               fullname:'赋闲的快门'
           }
       });
       Follows.insert({
           icon:'/follows/icon4.png',
           userId:followerId,
           username:'Veronica',
           fullname:'赋闲的快门',
           desc:"用第三只眼睛看这五彩的世界.",
           share1:'/follows/41.jpg',
           share2:'/follows/42.jpg',
           share3:'/follows/43.jpg'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/412.jpg'},{isImage:false,text:"Don't be panic"},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/413.jpg'},{isImage:false,text:'After storm it is beautiful'}],
          title:'I am Sailing',
          addontitle:'Just need a Sailboat',
          mainImage: 'http://www.ss750.cn/follows/411.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'赋闲的快门',
          ownerIcon:'/follows/icon4.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/422.jpg'},{isImage:false,text:'有纯真的时光'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/423.jpg'},{isImage:false,text:'像个秘密藏在我的心上'}],
          title:'有一个地方',
          addontitle:'只有我知道',
          mainImage: 'http://www.ss750.cn/follows/421.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'赋闲的快门',
          ownerIcon:'/follows/icon4.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/432.jpg'},{isImage:false,text:'Wonderful woman'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/433.jpg'},{isImage:false,text:'Wonderful world'}],
          title:'Wonderful Night',
          addontitle:'Wonderful World',
          mainImage: 'http://www.ss750.cn/follows/431.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'赋闲的快门',
          ownerIcon:'/follows/icon4.png',
          createdAt: new Date(),
          layout: '[]'
       });
//创建偶像用户5
       followerId = Accounts.createUser({
           username:'Philip',
           password:'actiontec123',
           email:'PhilipBloom@ggmail.com',
           profile:{
               icon:'/follows/icon5.png',
               fullname:'银羽飞舞'
           }
       });
       Follows.insert({
           icon:'/follows/icon5.png',
           userId:followerId,
           username:'Philip',
           fullname:'银羽飞舞',
           desc:"用心灵感受，用镜头记忆！",
           share1:'/follows/51.jpg',
           share2:'/follows/52.jpg',
           share3:'/follows/53.jpg'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/512.jpg'},{isImage:false,text:'是森林深处满目的萤火虫'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/513.jpg'},{isImage:false,text:'还是天涯海角的云雾缭绕'}],
          title:'天堂',
          addontitle:'在哪里',
          mainImage: 'http://www.ss750.cn/follows/511.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'银羽飞舞',
          ownerIcon:'/follows/icon5.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/522.jpg'},{isImage:false,text:'是含笑遮面'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/523.jpg'},{isImage:false,text:'还是直直地看着我'}],
          title:'天使',
          addontitle:'你的样子',
          mainImage: 'http://www.ss750.cn/follows/521.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'银羽飞舞',
          ownerIcon:'/follows/icon5.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/532.jpg'},{isImage:false,text:'I miss you'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/533.jpg'},{isImage:false,text:'I want you'}],
          title:'How Deep Is Your Love',
          addontitle:'The Note Book',
          mainImage: 'http://www.ss750.cn/follows/531.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'银羽飞舞',
          ownerIcon:'/follows/icon5.png',
          createdAt: new Date(),
          layout: '[]'
       });
//创建偶像用户6
       followerId = Accounts.createUser({
           username:'Doug',
           password:'actiontec123',
           email:'DougMenuez@ggmail.com',
           profile:{
               icon:'/follows/icon6.png',
               fullname:'天高神远'
           }
       });
       Follows.insert({
           icon:'/follows/icon6.png',
           userId:followerId,
           username:'Doug',
           fullname:'天高神远',
           desc:"光影魅力无限 实话实说是我的个性 不断追求突破自我就是进步！",
           share1:'/follows/61.jpg',
           share2:'/follows/62.jpg',
           share3:'/follows/63.jpg'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/612.jpg'},{isImage:false,text:'一瞬间'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/613.jpg'},{isImage:false,text:'有没有'}],
          title:'怦然',
          addontitle:'心动',
          mainImage: 'http://www.ss750.cn/follows/611.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'天高神远',
          ownerIcon:'/follows/icon6.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/622.jpg'},{isImage:false,text:'Minerva这个名字来自罗马的知识，魔法，医药，商业和防御女神'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/623.jpg'},{isImage:false,text:'三个女神发现了这个苹果，让特洛伊王子Paris选择谁是最美的'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/624.jpg'},{isImage:false,text:'Phrygia人的帽子'}],
          title:'辛黛瑞拉',
          addontitle:'希腊神话与艺术作品',
          mainImage: 'http://www.ss750.cn/follows/621.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'天高神远',
          ownerIcon:'/follows/icon6.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          pub: [{isImage:true,imgUrl:'http://www.ss750.cn/follows/632.jpg'},{isImage:false,text:'Jacques Louis David Oath of the Horatii'},
                {isImage:true,imgUrl:'http://www.ss750.cn/follows/633.jpg'},{isImage:false,text:'Septimius severus busto Musei Capitolini'}],
          title:'Aeneas',
          addontitle:'关于特洛伊的画和雕塑',
          mainImage: 'http://www.ss750.cn/follows/631.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'天高神远',
          ownerIcon:'/follows/icon6.png',
          createdAt: new Date(),
          layout: '[]'
       });
    }
});
