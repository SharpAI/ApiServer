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
import android.content.Intent;
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
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        if (Intent.ACTION_SEND.equals(intent.getAction()))
        {
          String type = intent.getType();

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
            if (uri != null) {
              String content = "[\'" + getPath(uri) + "\']";
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
                  content = content + "\'" + getPath(uri) + "\'";
                }
                else {
                  content = content + ",\'" + getPath(uri) + "\'";
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
        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }

    private String getPath(Uri uri) {
      String[] projection = { MediaStore.Images.Media.DATA };
      Cursor cursor = managedQuery(uri, projection, null, null, null);
      startManagingCursor(cursor);
      int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
      cursor.moveToFirst();
      String path = cursor.getString(column_index);
      path = "file://" + path;
      return path;
    }
}
