package com.tiegushi.cordova.tts;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.baidu.speechsynthesizer.publicutility.SpeechLogger;

import android.content.Context;
import android.media.AudioManager;

import android.util.Log;

import com.baidu.speechsynthesizer.SpeechSynthesizer;
import com.baidu.speechsynthesizer.SpeechSynthesizerListener;
import com.baidu.speechsynthesizer.publicutility.DataInfoUtils;
import com.baidu.speechsynthesizer.publicutility.SpeechError;

public class TTS extends CordovaPlugin implements SpeechSynthesizerListener{
	static {
        System.loadLibrary("gnustl_shared");
        // 部分版本不需要BDSpeechDecoder_V1
        try {
            System.loadLibrary("BDSpeechDecoder_V1");
        } catch (UnsatisfiedLinkError e) {
            SpeechLogger.logD("load BDSpeechDecoder_V1 failed, ignore");
        }
        System.loadLibrary("bd_etts");
        System.loadLibrary("bds");
	}
	private SpeechSynthesizer speechSynthesizer;
	private Context context;
	private CallbackContext callbackContext;
	private PluginResult.Status status = PluginResult.Status.OK;
    public static final String ERR_INVALID_OPTIONS = "ERR_INVALID_OPTIONS";

    @Override
    public void initialize(CordovaInterface cordova, final CordovaWebView webView) {
    	this.context=cordova.getActivity().getApplicationContext();
    	init();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext)
            throws JSONException {
        this.callbackContext = callbackContext;
        if (action.equals("speak")) {
            speak(args, callbackContext);
        } else if (action.equals("stop")) {
        	cancle();
        } else if (action.equals("pause")) {
        	pause();
        } else if (action.equals("resume")) {
        	resume();
        } else {
            return false;
        }
        return true;
    }

    private void speak(JSONArray args, CallbackContext callbackContext)
            throws JSONException, NullPointerException {
        JSONObject params = args.getJSONObject(0);

        if (params == null) {
            callbackContext.error(ERR_INVALID_OPTIONS);
            return;
        }

        String text;

        if (params.isNull("text")) {
            callbackContext.error(ERR_INVALID_OPTIONS);
            return;
        } else {
            text = params.getString("text");
        }

        bspeak(text);
    }
    
    //start baidu tts code
	private void init() {
		speechSynthesizer = SpeechSynthesizer.newInstance(SpeechSynthesizer.SYNTHESIZER_AUTO, context, "holder", this);
		// 此处需要将setApiKey方法的两个参数替换为你在百度开发者中心注册应用所得到的apiKey和secretKey
		speechSynthesizer.setApiKey("iepMQqCsCil8uvGT2fPIP8lGMQDObIVi",
				"BlTv4N92QQb9F28vGXLkODdc3sOsXoUl");
		speechSynthesizer.setAppId("6092105");

        // TTS所需的资源文件，可以放在任意可读目录，可以任意改名
        String ttsTextModelFilePath =
                context.getApplicationInfo().dataDir + "/lib/libbd_etts_text.dat.so";
        String ttsSpeechModelFilePath =
                context.getApplicationInfo().dataDir + "/lib/libbd_etts_speech_female.dat.so";
        speechSynthesizer.setParam(SpeechSynthesizer.PARAM_TTS_TEXT_MODEL_FILE, ttsTextModelFilePath);
        speechSynthesizer.setParam(SpeechSynthesizer.PARAM_TTS_SPEECH_MODEL_FILE, ttsSpeechModelFilePath);
        DataInfoUtils.verifyDataFile(ttsTextModelFilePath);
        DataInfoUtils.getDataFileParam(ttsTextModelFilePath, DataInfoUtils.TTS_DATA_PARAM_DATE);
        DataInfoUtils.getDataFileParam(ttsTextModelFilePath, DataInfoUtils.TTS_DATA_PARAM_SPEAKER);
        DataInfoUtils.getDataFileParam(ttsTextModelFilePath, DataInfoUtils.TTS_DATA_PARAM_GENDER);
        DataInfoUtils.getDataFileParam(ttsTextModelFilePath, DataInfoUtils.TTS_DATA_PARAM_CATEGORY);
        DataInfoUtils.getDataFileParam(ttsTextModelFilePath, DataInfoUtils.TTS_DATA_PARAM_LANGUAGE);
        speechSynthesizer.initEngine();
		speechSynthesizer.setAudioStreamType(AudioManager.STREAM_MUSIC);
		setParams();
	}

	public void bspeak(final String content) {
		 new Thread(new Runnable() {
             @Override
             public void run() {
                 int ret = speechSynthesizer.speak(content.toString());
                 if (ret != 0) {
                     Log.e("inf","开始合成器失败："+ret);
                 }
             }
         }).start();
	}

	public void cancle() {
		speechSynthesizer.cancel();
	}

	public void pause() {
		speechSynthesizer.pause();
	}

	public void resume() {
		speechSynthesizer.resume();
	}

	private void setParams() {
		speechSynthesizer.setParam(SpeechSynthesizer.PARAM_SPEAKER, "0");//发音人，目前支持女声(0)和男声(1) 
		speechSynthesizer.setParam(SpeechSynthesizer.PARAM_VOLUME, "9");//音量，取值范围[0, 9]，数值越大，音量越大
		speechSynthesizer.setParam(SpeechSynthesizer.PARAM_SPEED, "5");//朗读语速，取值范围[0, 9]，数值越大，语速越快
		speechSynthesizer.setParam(SpeechSynthesizer.PARAM_PITCH, "5");//音调，取值范围[0, 9]，数值越大，音量越高
		speechSynthesizer.setParam(SpeechSynthesizer.PARAM_AUDIO_ENCODE,
				SpeechSynthesizer.AUDIO_ENCODE_AMR);//音频格式，支持bv/amr/opus/mp3，取值详见随后常量声明
		speechSynthesizer.setParam(SpeechSynthesizer.PARAM_AUDIO_RATE,
				SpeechSynthesizer.AUDIO_BITRATE_AMR_15K85);//音频比特率，各音频格式支持的比特率详见随后常量声明
	}
	

	@Override
	public void onBufferProgressChanged(SpeechSynthesizer synthesizer, int progress) {
		// TODO Auto-generated method stub
		//"缓冲进度" + progress
		
	}

	@Override
	public void onCancel(SpeechSynthesizer synthesizer) {
		// TODO Auto-generated method stub
		//"已取消"
		
	}

	@Override
	public void onError(SpeechSynthesizer synthesizer, SpeechError error) {
		// TODO Auto-generated method stub
		//"发生错误：" + error
		
	}

	@Override
	public void onNewDataArrive(SpeechSynthesizer synthesizer, byte[] audioData,
			boolean isLastData) {
		// TODO Auto-generated method stub
		//"新的音频数据：" + audioData.length + (isLastData ? ("end") : "")
		
	}

	@Override
	public void onSpeechFinish(SpeechSynthesizer synthesizer) {
		// TODO Auto-generated method stub
		//"朗读已停止"
		callbackContext.sendPluginResult(new PluginResult(status, "succ"));
		
	}

	@Override
	public void onSpeechPause(SpeechSynthesizer synthesizer) {
		// TODO Auto-generated method stub
		//"朗读已暂停"
		
	}

	@Override
	public void onSpeechProgressChanged(SpeechSynthesizer synthesizer, int progress) {
		// TODO Auto-generated method stub
		//"朗读进度"
		
	}

	@Override
	public void onSpeechResume(SpeechSynthesizer synthesizer) {
		// TODO Auto-generated method stub
		//"朗读继续"
		
	}

	@Override
	public void onSpeechStart(SpeechSynthesizer synthesizer) {
		// TODO Auto-generated method stub
		//"朗读开始"
		
	}

	@Override
	public void onStartWorking(SpeechSynthesizer synthesizer) {
		// TODO Auto-generated method stub
		//"开始工作，请等待数据..."
		
	}

	@Override
	public void onSynthesizeFinish(SpeechSynthesizer synthesizer) {
		// TODO Auto-generated method stub
		//"合成已完成"
		
	}
}
