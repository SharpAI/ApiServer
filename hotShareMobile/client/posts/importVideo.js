importVideo = {
  getVideoUrlFromUrl: function(url){
    if(!url)
      return '';
    
    var uri = importVideo.parseURL(url);
    switch(uri.host){
      case 'v.youku.com':
      case 'm.youku.com':
        var id = uri.file.replace('id_', '').replace('.html', '');
        if (!id)
          return '';
        return 'http://player.youku.com/embed/' + id;
      case 'm.v.qq.com':
        if (uri.params.vid)
          return 'https://v.qq.com/iframe/player.html?vid=' + uri.params.vid + '&tiny=0&auto=0';
        else if(uri.file.replace('.html', ''))
          return 'https://v.qq.com/iframe/player.html?vid=' + uri.file.replace('.html', '') + '&tiny=0&auto=0';
        return '';
      default:
        return '';
    }
  },
  parseURL: function(url){
    var a = document.createElement('a')
    a.href = url;
    return {
      source: url,
      protocol: a.protocol.replace(':', ''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function(){
        var ret = {}, seg = a.search.replace(/^\?/, '').split('&'), len = seg.length, i = 0, s;
        for (; i<len; i++){
          if (!seg[i])
            continue;
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
        return ret;
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
      hash: a.hash.replace('#', ''),
      path: a.pathname.replace(/^([^\/])/, '/$1'),
      relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
      segments: a.pathname.replace(/^\//, '').split('/')
    };
  }
}