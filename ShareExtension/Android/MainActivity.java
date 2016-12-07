/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package org.hotshare.everywhere;

import android.os.Bundle;
import android.os.Build;
import android.content.Intent;
import android.content.Context;
import android.content.SharedPreferences;

import android.util.Log;
import java.util.ArrayList;
import java.util.Set;
import android.net.Uri;
import android.provider.MediaStore;
import android.database.Cursor;

import org.apache.cordova.*;

public class MainActivity extends CordovaActivity
{
    private void handleIntent(Intent intent) {
      Log.i("##RDBG", "action: " + intent.getAction());
      if (Intent.ACTION_SEND.equals(intent.getAction()))
      {
        String type = intent.getType();
        Log.i("##RDBG", "type: " + intent.getType());
        if (type.indexOf("text/plain") >= 0) {
          String txt = intent.getStringExtra(Intent.EXTRA_TEXT);
          if (txt != null && txt.length() > 0) {
            String content = "[\'" + txt + "\']";
            SharedPreferences settings = getSharedPreferences("org.hotshare.everywhere.sysshare", 0);
            SharedPreferences.Editor editor = settings.edit();
            editor.putString("shareType", "url");
            editor.putString("shareContent", content);
            editor.commit();
            Log.i("##RDBG", "share content: " + content);
          }
        }
        else if (type.indexOf("image/") >= 0) {
          Uri uri = (Uri)intent.getExtras().get(Intent.EXTRA_STREAM);
          String txt = intent.getStringExtra(Intent.EXTRA_TEXT);
          Log.i("##RDBG", "image type with txt: " + txt);
          String url_txt = null;
          boolean img_txt = false;
          if (txt != null && txt.length() > 0) {
            int idx = txt.indexOf("http://");
            if (idx == -1)
              idx = txt.indexOf("https://");
            if (idx != -1)
              url_txt = txt.substring(idx);
            if (url_txt != null) {
              Log.i("##RDBG", "img_txt: " + url_txt);
              img_txt = true;
              String content = "[\'" + url_txt + "\']";
              SharedPreferences settings = getSharedPreferences("org.hotshare.everywhere.sysshare", 0);
              SharedPreferences.Editor editor = settings.edit();
              editor.putString("shareType", "url");
              editor.putString("shareContent", content);
              editor.commit();
              Log.i("##RDBG", "share content: " + content);
            }
          }
          if (!img_txt && uri != null) {
            String content = "[\'" + getPath(this, uri) + "\']";
            SharedPreferences settings = getSharedPreferences("org.hotshare.everywhere.sysshare", 0);
            SharedPreferences.Editor editor = settings.edit();
            editor.putString("shareType", "image");
            editor.putString("shareContent", content);
            editor.commit();
            Log.i("##RDBG", "share content: " + content);
          }
        }
      }
      else if (Intent.ACTION_SEND_MULTIPLE.equals(intent.getAction()))
      {
        ArrayList<Uri> imageUris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
        if (imageUris != null && imageUris.size() > 0) {
          String content = "[";
          if (imageUris != null) {
            boolean first = true;
            for (Uri uri: imageUris) {
              if (first) {
                first = false;
                content = content + "\'" + getPath(this, uri) + "\'";
              }
              else {
                content = content + ",\'" + getPath(this, uri) + "\'";
              }
            }
          }
          content =  content + "]";
          SharedPreferences settings = getSharedPreferences("org.hotshare.everywhere.sysshare", 0);
          SharedPreferences.Editor editor = settings.edit();
          editor.putString("shareType", "image");
          editor.putString("shareContent", content);
          editor.commit();
          Log.i("##RDBG", "share content: " + content);
        }
      }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Log.i("##RDBG", "onNewIntent come in");
        if (intent != null) {
          Log.i("##RDBG", "onNewIntent handleIntent");
          handleIntent(intent);
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        if (intent != null) {
          Log.i("##RDBG", "onCreate handleIntent");
          handleIntent(intent);
        }
        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }

    /*private String getPath(Uri uri) {
      Log.i("##RDBG", "getPath, uri: " + uri.getPath());
      Log.i("##RDBG", "schema: " + uri.getScheme());
      String[] projection = { MediaStore.Images.Media.DATA };
      Cursor cursor = managedQuery(uri, projection, null, null, null);
      startManagingCursor(cursor);
      int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
      cursor.moveToFirst();
      String path = cursor.getString(column_index);
      path = "file://" + path;
      return path;
    }*/

    public static String getPath(final Context context, final Uri uri) {
      final boolean isKitKat = Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;
      Log.i("URI",uri+"");
      String result = uri+"";
      // DocumentProvider
      //  if (isKitKat && DocumentsContract.isDocumentUri(context, uri)) {
      if (isKitKat && (result.contains("media.documents"))) {
        String[] ary = result.split("/");
        int length = ary.length;
        String imgary = ary[length-1];
        final String[] dat = imgary.split("%3A");

        final String docId = dat[1];
        final String type = dat[0];

        Uri contentUri = null;
        if ("image".equals(type)) {
            contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        } else if ("video".equals(type)) {

        } else if ("audio".equals(type)) {
        }

        final String selection = "_id=?";
        final String[] selectionArgs = new String[] {
                dat[1]
        };

        return "file://" + getDataColumn(context, contentUri, selection, selectionArgs);
      }
      else if ("content".equalsIgnoreCase(uri.getScheme())) {
        return "file://" + getDataColumn(context, uri, null, null);
      }
      // File
      else if ("file".equalsIgnoreCase(uri.getScheme())) {
        return "file://" + uri.getPath();
      }

      return null;
    }

    public static String getDataColumn(Context context, Uri uri, String selection,
                                   String[] selectionArgs) {
      Cursor cursor = null;
      final String column = "_data";
      final String[] projection = {
            column
      };

      try {
        cursor = context.getContentResolver().query(uri, projection, selection, selectionArgs,
                null);
        if (cursor != null && cursor.moveToFirst()) {
            final int column_index = cursor.getColumnIndexOrThrow(column);
            return cursor.getString(column_index);
        }
      } finally {
        if (cursor != null)
            cursor.close();
      }
      return null;
    }
}
