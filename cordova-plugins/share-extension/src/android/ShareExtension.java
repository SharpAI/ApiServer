package com.actiontec.hotshare.sysshare;

import android.app.Notification;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import android.content.SharedPreferences;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class ShareExtension extends CordovaPlugin {

	public ShareExtension() {
	}

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
	}

	@Override
	public boolean execute(final String action, final JSONArray data,
			final CallbackContext callbackContext) throws JSONException {
    if (action.equals("getShareData")) {
			SharedPreferences settings = cordova.getActivity().getSharedPreferences("org.hotshare.everywhere.sysshare", 0);
			String type = settings.getString("shareType", null);
      String content = settings.getString("shareContent", null);
			Log.i("##RDBG", "getShareData type: " + type + ", content: " + content);
			if (type != null && content != null && type.length() > 0 && content.length() > 0) {
				JSONObject response = new JSONObject();
	      try {
					JSONArray contentArray = new JSONArray(content);
	        response.put("type", type);
					response.put("content", contentArray);
	      } catch (JSONException e) {
	        Log.e("##RDBG", e.getMessage());
	      }
	      callbackContext.success(response);
			}

			return true;
    }
    else if (action.equals("emptyData")) {
			SharedPreferences settings = cordova.getActivity().getSharedPreferences("org.hotshare.everywhere.sysshare", 0);
			SharedPreferences.Editor editor = settings.edit();
			editor.putString("shareType", null);
			editor.putString("shareContent", null);
			editor.commit();
			callbackContext.success("success");
			return true;
    }
    else if (action.equals("closeView")) {

    }
    else if (action.equals("deleteFiles")) {

    }
    return false;
  }
}
