package com.oauth.wechat;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.widget.Toast;

import com.tencent.mm.sdk.modelmsg.SendAuth;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.WXAPIFactory;

public class WechatOauth extends CordovaPlugin {
  public static String TAG = "com.oauth.wechat";
  public CallbackContext callbackContext;

  private IWXAPI api;
  final String APP_ID = "wxcfcf19c225a36351";
  public static WechatOauth wechat = null;

  public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
      wechat = this;
      this.callbackContext = callbackContext;
      final Context context = this.cordova.getActivity().getApplicationContext();
      api = WXAPIFactory.createWXAPI(context, APP_ID, false);
      if (!api.isWXAppInstalled()) {
        cordova.getActivity().runOnUiThread(new Runnable() {
          public void run() {
            Toast.makeText(context, "您还未安装微信客户端", Toast.LENGTH_SHORT).show();
          }
        });
        callbackContext.error("Wechat not installed");
        return false;         
      }
      api.registerApp(APP_ID);
      final SendAuth.Req req = new SendAuth.Req();
      req.scope = "snsapi_userinfo";
      req.state = "wechat_sdk_demo_test";
      api.sendReq(req);
      return true;
  }
}
