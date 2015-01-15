Meteor.startup(function(){
//创建Follows推荐列表数据库
//如果数据中没有记录，创建用户，然后加到推荐列表数据库Follows中
//这样可以加快拉出推荐列表的速度。
    if(Follows.find().count() === 0){
       Accounts.createUser({
           username:'Chase',
           password:'actiontec123',
           email:'ChaseJarvis@ggmail.com',
           profile:{
               icon:'icon1.png',
               fullname:'Chase Jarvis'
           }
       });
       Follows.insert({
           icon:'icon1.png',
           userId:Meteor.users.findOne({username:'Chase'})._id,
           username:'Chase',
           fullname:'Chase Jarvis',
           desc:"I'm a photographer and an enterpreneur. I love to create stuff + connect with amazing people.",
           share1:'11.jpg',
           share2:'12.jpg',
           share3:'13.jpg'
       });
       Accounts.createUser({
           username:'Rocco',
           password:'actiontec123',
           email:'RoccoDispirito@ggmail.com',
           profile:{
               icon:'icon2.png',
               fullname:'Rocco Dispirito'
           }
       });
       Follows.insert({
           icon:'icon2.png',
           userId:Meteor.users.findOne({username:'Rocco'})._id,
           username:'Rocco',
           fullname:'Rocco Dispirito',
           desc:"I am a chef and life-long student of cuisine, #1 best-selling author of The Pound A Day Diet & the Now Eat This! series.",
           share1:'21.jpg',
           share2:'22.jpg',
           share3:'23.jpg'
       });
       Accounts.createUser({
           username:'Matt',
           password:'actiontec123',
           email:'MattCrump@ggmail.com',
           profile:{
               icon:'icon3.png',
               fullname:'Matt Crump'
           }
       });
       Follows.insert({
           icon:'icon3.png',
           userId:Meteor.users.findOne({username:'Matt'})._id,
           username:'Matt',
           fullname:'Matt Crump',
           desc:"the candy-colored minimalist photographer",
           share1:'31.jpg',
           share2:'32.jpg',
           share3:'33.jpg'
       });
       Accounts.createUser({
           username:'Veronica',
           password:'actiontec123',
           email:'VeronicaBelmont@ggmail.com',
           profile:{
               icon:'icon4.png',
               fullname:'Veronica Belmont'
           }
       });
       Follows.insert({
           icon:'icon4.png',
           userId:Meteor.users.findOne({username:'Veronica'})._id,
           username:'Veronica',
           fullname:'Veronica Belmont',
           desc:"New media/ TV host and writer. Slayer of vampires.",
           share1:'41.jpg',
           share2:'42.jpg',
           share3:'43.jpg'
       });
       Accounts.createUser({
           username:'Philip',
           password:'actiontec123',
           email:'PhilipBloom@ggmail.com',
           profile:{
               icon:'icon5.png',
               fullname:'Philip Bloom'
           }
       });
       Follows.insert({
           icon:'icon5.png',
           userId:Meteor.users.findOne({username:'Philip'})._id,
           username:'Philip',
           fullname:'Philip Bloom',
           desc:"Just a filmmaker & a website. Trying to shoot & help as much as I can whilst trying to find my place in the world. Sharing my photos and video snippets here",
           share1:'51.jpg',
           share2:'52.jpg',
           share3:'53.jpg'
       });
       Accounts.createUser({
           username:'Doug',
           password:'actiontec123',
           email:'DougMenuez@ggmail.com',
           profile:{
               icon:'icon6.png',
               fullname:'Doug Menuez'
           }
       });
       Follows.insert({
           icon:'icon6.png',
           userId:Meteor.users.findOne({username:'Doug'})._id,
           username:'Doug',
           fullname:'Doug Menuez',
           desc:"Documentary photographer and filmmaker",
           share1:'61.jpg',
           share2:'62.jpg',
           share3:'63.jpg'
       });
    }
});
