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
               fullname:'Chase Jarvis'
           }
       });
//加入偶像推荐列表
       Follows.insert({
           icon:'/follows/icon1.png',
           userId:followerId,
           username:'Chase',
           fullname:'Chase Jarvis',
           desc:"I'm a photographer and an enterpreneur. I love to create stuff + connect with amazing people.",
           share1:'/follows/11.jpg',
           share2:'/follows/12.jpg',
           share3:'/follows/13.jpg'
       });
//加偶像的3个Post
       Posts.insert({
          title:'漫步厦门',
          addontitle:'寻找文艺小清新',
          mainImage: '/follows/11.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Chase Jarvis',
          ownerIcon:'/follows/icon1.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'三峡大坝',
          addontitle:'盛世峡江壮美大坝',
          mainImage: '/follows/12.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Chase Jarvis',
          ownerIcon:'/follows/icon1.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'斯坦福大学',
          addontitle:'巍巍珞珈百年名校',
          mainImage: '/follows/13.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Chase Jarvis',
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
               fullname:'Rocco Dispirito'
           }
       });
       Follows.insert({
           icon:'/follows/icon2.png',
           userId:followerId,
           username:'Rocco',
           fullname:'Rocco Dispirito',
           desc:"I am a chef and life-long student of cuisine, #1 best-selling author of The Pound A Day Diet & the Now Eat This! series.",
           share1:'/follows/21.jpg',
           share2:'/follows/22.jpg',
           share3:'/follows/23.jpg'
       });
       Posts.insert({
          title:'古城泡温泉',
          addontitle:'徜徉古街泡温泉 古城中的别样假日',
          mainImage: '/follows/21.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Rocco Dispirito',
          ownerIcon:'/follows/icon2.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'浪漫巴黎',
          addontitle:'时尚碰撞古老',
          mainImage: '/follows/22.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Rocco Dispirito',
          ownerIcon:'/follows/icon2.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'宫阙志',
          addontitle:'首尔历史体验一日游',
          mainImage: '/follows/23.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Rocco Dispirito',
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
               fullname:'Matt Crump'
           }
       });
       Follows.insert({
           icon:'/follows/icon3.png',
           userId:followerId,
           username:'Matt',
           fullname:'Matt Crump',
           desc:"the candy-colored minimalist photographer",
           share1:'/follows/31.jpg',
           share2:'/follows/32.jpg',
           share3:'/follows/33.jpg'
       });
       Posts.insert({
          title:'奥兰多',
          addontitle:'童话编织的梦幻城市',
          mainImage: '/follows/31.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Matt Crump',
          ownerIcon:'/follows/icon3.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'山水清音',
          addontitle:'庞泉沟漂流清凉一夏',
          mainImage: '/follows/32.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Matt Crump',
          ownerIcon:'/follows/icon3.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'行走石台',
          addontitle:'体验原生态山水之美',
          mainImage: '/follows/33.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Matt Crump',
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
               fullname:'Veronica Belmont'
           }
       });
       Follows.insert({
           icon:'/follows/icon4.png',
           userId:followerId,
           username:'Veronica',
           fullname:'Veronica Belmont',
           desc:"New media/ TV host and writer. Slayer of vampires.",
           share1:'/follows/41.jpg',
           share2:'/follows/42.jpg',
           share3:'/follows/43.jpg'
       });
       Posts.insert({
          title:'挪威的森林',
          addontitle:'弗洛姆高山小火车之旅',
          mainImage: '/follows/41.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Veronica Belmont',
          ownerIcon:'/follows/icon4.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'玩转世外桃源',
          addontitle:'不一样的大溪地',
          mainImage: '/follows/42.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Veronica Belmont',
          ownerIcon:'/follows/icon4.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'歌乐山一日行',
          addontitle:'感受山城红色记忆',
          mainImage: '/follows/43.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Veronica Belmont',
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
               fullname:'Philip Bloom'
           }
       });
       Follows.insert({
           icon:'/follows/icon5.png',
           userId:followerId,
           username:'Philip',
           fullname:'Philip Bloom',
           desc:"Just a filmmaker & a website. Trying to shoot & help as much as I can whilst trying to find my place in the world. Sharing my photos and video snippets here",
           share1:'/follows/51.jpg',
           share2:'/follows/52.jpg',
           share3:'/follows/53.jpg'
       });
       Posts.insert({
          title:'乐享梯',
          addontitle:'全球最美梯田 遂川高山如画',
          mainImage: '/follows/51.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Philip Bloom',
          ownerIcon:'/follows/icon5.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'首尔弘大',
          addontitle:'粉色童话之旅',
          mainImage: '/follows/52.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Philip Bloom',
          ownerIcon:'/follows/icon5.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'波士顿龙虾湾',
          addontitle:'悠游明媚东海岸',
          mainImage: '/follows/53.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Philip Bloom',
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
               fullname:'Doug Menuez'
           }
       });
       Follows.insert({
           icon:'/follows/icon6.png',
           userId:followerId,
           username:'Doug',
           fullname:'Doug Menuez',
           desc:"Documentary photographer and filmmaker",
           share1:'/follows/61.jpg',
           share2:'/follows/62.jpg',
           share3:'/follows/63.jpg'
       });
       Posts.insert({
          title:'吃虾子的季节',
          addontitle:'去万松园看繁华市井',
          mainImage: '/follows/61.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Doug Menuez',
          ownerIcon:'/follows/icon6.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'悉尼',
          addontitle:'澳大利亚最大城市',
          mainImage: '/follows/62.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Doug Menuez',
          ownerIcon:'/follows/icon6.png',
          createdAt: new Date(),
          layout: '[]'
       });
       Posts.insert({
          title:'赫尔辛基',
          addontitle:'芬兰首都,波罗的海的明珠',
          mainImage: '/follows/63.jpg',
          heart:[],  
          retweet:[],
          comment:[],
          owner:followerId,
          ownerName:'Doug Menuez',
          ownerIcon:'/follows/icon6.png',
          createdAt: new Date(),
          layout: '[]'
       });
    }
});
