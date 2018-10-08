bytesToSize = function (bytes) {
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 B';
  if (typeof bytes === 'number') {
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1000, i)).toFixed(1) + ' ' + sizes[i];
  } else {
    return 'N/A'
  }
}
bytesToSizePerSeconds = function (bytes) {
  var sizes = ['B/S', 'KB/S', 'MB/S', 'GB/S', 'TB/S'];
  if (bytes == 0) return '0 B/S';
  if (typeof bytes === 'number') {
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1000, i)).toFixed(1) + ' ' + sizes[i];
  } else {
    return 'N/A'
  }
}