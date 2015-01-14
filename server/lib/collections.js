Meteor.startup(function(){
    if(Follows.find().count() === 0){
       Follows.insert({icon:'icon1.png',userId:"slkdfjsldkfjsd" , username:'Chase Jarvis', desc:"I'm a photographer and an enterpreneur. I love to create stuff + connect with amazing people.", share1:'11.jpg', share2:'12.jpg', share3:'13.jpg'});
       Follows.insert({icon:'icon2.png', userId:"slkdfjsldkfjsd" , username:'Rocco Dispirito', desc:'I am a chef and life-long student of cuisine, #1 best-selling author of The Pound A Day Diet & the Now Eat This! series.', share1:'21.jpg', share2:'22.jpg', share3:'23.jpg'});
       Follows.insert({icon:'icon3.png',userId:"slkdfjsldkfjsd" , username:'Matt Crump', desc:'the candy-colored minimalist photographer', share1:'31.jpg', share2:'32.jpg', share3:'33.jpg'});
       Follows.insert({icon:'icon4.png',userId:"slkdfjsldkfjsd" , username:'Veronica Belmont', desc:'New media/ TV host and writer. Slayer of vampires.', share1:'41.jpg', share2:'42.jpg', share3:'43.jpg'});
       Follows.insert({icon:'icon5.png',userId:"slkdfjsldkfjsd" , username:'Philip Bloom', desc:'Just a filmmaker & a website. Trying to shoot & help as much as I can whilst trying to find my place in the world. Sharing my photos and video snippets here', share1:'51.jpg', share2:'52.jpg', share3:'53.jpg'});
       Follows.insert({icon:'icon6.png',userId:"slkdfjsldkfjsd" , username:'Rocco Dispirito', desc:'I am a chef and life-long student of cuisine, #1 best-selling author of The Pound A Day Diet & the Now Eat This! series.', share1:'61.jpg', share2:'62.jpg', share3:'63.jpg'});
    }
});
