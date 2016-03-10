package org.hotshare.everywhere.wxapi;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.io.BufferedReader;  
import java.io.DataOutputStream;  
import java.io.InputStreamReader;  
import java.net.HttpURLConnection;  
import java.net.URL;  
import java.net.URLEncoder; 
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import com.tencent.mm.sdk.modelbase.BaseReq;
import com.tencent.mm.sdk.modelbase.BaseResp;
import com.tencent.mm.sdk.modelmsg.SendAuth;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.sdk.constants.ConstantsAPI;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import com.wordsbaking.cordova.wechat.WeChat;

/*
    Cordova WeChat Plugin
    https://github.com/vilic/cordova-plugin-wechat

    by VILIC VANE
    https://github.com/vilic

    MIT License
*/

public class WXEntryActivity extends Activity implements IWXAPIEventHandler{
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WeChat.api.handleIntent(getIntent(), this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        WeChat.api.handleIntent(intent, this);
    }

    @Override
    public void onReq(BaseReq req) {
        // not implemented
        finish();
    }

    @Override
    public void onResp(BaseResp resp) {
        switch (resp.errCode) {
            case BaseResp.ErrCode.ERR_OK:
                Log.d(WeChat.TAG, resp.toString());
                switch (resp.getType()) {
                  case ConstantsAPI.COMMAND_SENDAUTH:
                    SendAuth.Resp res = ((SendAuth.Resp) resp);
                    Log.i(WeChat.TAG, res.code);
                    JSONObject response = new JSONObject();
                    try {
                      response.put("code", res.code);
                      response.put("state", res.state);
                      response.put("country", res.country);
                      response.put("lang", res.lang);
                    } catch (JSONException e) {
                      Log.e(WeChat.TAG, e.getMessage());
                    }
                    WeChat.currentCallbackContext.success(response);
                    Log.d(WeChat.TAG, res.code);
                    finish();
                  default:
                    WeChat.currentCallbackContext.success();
                    finish();
                }
                break;
            case BaseResp.ErrCode.ERR_USER_CANCEL:
                WeChat.currentCallbackContext.error(WeChat.ERR_USER_CANCEL);
                break;
            case BaseResp.ErrCode.ERR_AUTH_DENIED:
                WeChat.currentCallbackContext.error(WeChat.ERR_AUTH_DENIED);
                break;
            case BaseResp.ErrCode.ERR_SENT_FAILED:
                WeChat.currentCallbackContext.error(WeChat.ERR_SENT_FAILED);
                break;
            case BaseResp.ErrCode.ERR_UNSUPPORT:
                WeChat.currentCallbackContext.error(WeChat.ERR_UNSUPPORT);
                break;
            case BaseResp.ErrCode.ERR_COMM:
                WeChat.currentCallbackContext.error(WeChat.ERR_COMM);
                break;
            default:
                WeChat.currentCallbackContext.error(WeChat.ERR_UNKNOWN);
                break;
        }
        
        if(resp.errCode != BaseResp.ErrCode.ERR_OK)
          finish();
    }
}
