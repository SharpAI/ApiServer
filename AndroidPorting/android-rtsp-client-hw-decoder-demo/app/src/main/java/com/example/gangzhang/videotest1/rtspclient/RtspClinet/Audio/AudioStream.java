package com.example.gangzhang.videotest1.rtspclient.RtspClinet.Audio;

import android.util.Log;

import com.example.gangzhang.videotest1.rtspclient.RtspClinet.Stream.RtpStream;

/**
 *
 */
public abstract class AudioStream extends RtpStream {
    private final static String tag = "AudioStream";

    protected void recombinePacket(StreamPacks streamPacks) {

    }
}
