package org.hotshare.everywhere.wxapi;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import org.apache.cordova.PluginResult;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.android.volley.Request.Method;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.oauth.wechat.WechatOauth;
import com.tencent.mm.sdk.constants.ConstantsAPI;
import com.tencent.mm.sdk.modelbase.BaseReq;
import com.tencent.mm.sdk.modelbase.BaseResp;
import com.tencent.mm.sdk.modelmsg.SendAuth;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.sdk.openapi.WXAPIFactory;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler {

	final String TAG = "WXEntryActivity";

	final String APP_ID = "wxcfcf19c225a36351";
	private IWXAPI api;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		api = WXAPIFactory.createWXAPI(this, APP_ID, false);
		api.handleIntent(getIntent(), this);
	}

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		setIntent(intent);
		api.handleIntent(getIntent(), this);
	}


	public void getToken(String code) {
		String url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + APP_ID + "&secret=dbafa3cb0167bbb80bb201ba10127da4&code=" + code + "&grant_type=authorization_code";
		RequestQueue mQueue = Volley.newRequestQueue(getApplicationContext());
		mQueue.add(new JsonObjectRequest(Method.GET, url, null, new Response.Listener<JSONObject>() {

			@Override
			public void onResponse(JSONObject response) {
				Log.d(TAG, response.toString());
				try {
					getUserinfo(response.getString("access_token"), response.getString("openid"));
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}

		}, new Response.ErrorListener() {

			@Override
			public void onErrorResponse(VolleyError response) {
				response.printStackTrace();
				WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK));
				WXEntryActivity.this.finish();
			}
		}));
		mQueue.start();
	}

	public void getUserinfo(String token, String openid) {

		String url = "https://api.weixin.qq.com/sns/userinfo?access_token=" + token + "&openid=" + openid;
		System.out.println(url);
		RequestQueue mQueue = Volley.newRequestQueue(getApplicationContext());

		JsonObjectRequest jsonR = new JsonObjectRequest(Method.GET, url, null, new Response.Listener<JSONObject>() {

			@Override
			public void onResponse(JSONObject response) {
				Log.d(TAG, response.toString());
				String json = response.toString();
				try {
					json = new String(json.getBytes("ISO-8859-1"), "utf-8");
				} catch (UnsupportedEncodingException e) {
					e.printStackTrace();
				}
				try {
					response = new JSONObject(json);
				} catch (JSONException e) {
					e.printStackTrace();
				}
				WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, response));
				WXEntryActivity.this.finish();
			}

		}, new Response.ErrorListener() {

			@Override
			public void onErrorResponse(VolleyError response) {
				response.printStackTrace();
				WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK));
				WXEntryActivity.this.finish();
			}
		}) {
			@Override
			public Map<String, String> getHeaders() {
				HashMap<String, String> headers = new HashMap<String, String>();
				headers.put("Accept", "application/json");
				headers.put("Content-Type", "application/json; charset=utf-8");
				return headers;
			}
		};
		mQueue.add(jsonR);
		mQueue.start();
	}

	public void getRefresh_token(String appid, String refresh_token) {
		String url = "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=" + appid + "&grant_type=refresh_token&refresh_token=" + refresh_token;
		RequestQueue mQueue = Volley.newRequestQueue(getApplicationContext());
		mQueue.add(new JsonObjectRequest(Method.GET, url, null, new Response.Listener<JSONObject>() {

			@Override
			public void onResponse(JSONObject response) {
				Log.d(TAG, response.toString());
				WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK));
				WXEntryActivity.this.finish();
			}

		}, new Response.ErrorListener() {

			@Override
			public void onErrorResponse(VolleyError response) {
				response.printStackTrace();
				WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK));
				WXEntryActivity.this.finish();
			}
		}));
		mQueue.start();
	}

	@Override
	public void onReq(BaseReq paramBaseReq) {

	}

	@Override
	public void onResp(BaseResp resp) {
		switch (resp.errCode) {
		case BaseResp.ErrCode.ERR_OK: {
			switch (resp.getType()) {
			case ConstantsAPI.COMMAND_SENDAUTH: {
				SendAuth.Resp r = (SendAuth.Resp) resp;
				getToken(r.code);
				break;
			}
			default: {
				WXEntryActivity.this.finish();
				break;
			}
			}
			break;
		}
		case BaseResp.ErrCode.ERR_USER_CANCEL:
			WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
			WXEntryActivity.this.finish();
			break;
		case BaseResp.ErrCode.ERR_AUTH_DENIED:
			WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
			WXEntryActivity.this.finish();
			break;
		default:
			WechatOauth.wechat.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
			WXEntryActivity.this.finish();
			break;
		}

	}

}
