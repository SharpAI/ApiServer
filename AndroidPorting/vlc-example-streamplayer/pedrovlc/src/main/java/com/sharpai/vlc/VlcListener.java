package com.sharpai.vlc;

import org.videolan.libvlc.MediaPlayer;
/**
 * Created by sharpai on 25/06/17.
 */
public interface VlcListener {

  void onComplete();

  void onError();

  void onTimeUpdate(MediaPlayer.Event event);
}
