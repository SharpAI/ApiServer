package org.easydarwin.player.simpleplayer;

import android.Manifest;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.SurfaceTexture;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Message;
import android.preference.PreferenceManager;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.util.Log;
import android.view.Gravity;
import android.view.TextureView;
import android.view.View;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.FrameLayout;


import org.easydarwin.video.EasyPlayerClient;

import java.io.File;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.Timer;
import java.util.TimerTask;

import com.example.screenshot.screenshot;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = MainActivity.class.getName();
    private EasyPlayerClient client;

    private static final int START_POST_MSG = 1001;
    private static final int PROCESS_SAVED_IMAGE_MSG = 1002;
    private long mStartTime = 0;// System.currentTimeMillis();
    private Handler mBackgroundHandler;
    private TextureView mTextureView;

    private static final int REQUESTCODE_PERMISSION_STORAGE = 1234;

    class MyCallback implements Handler.Callback {

        @Override
        public boolean handleMessage(Message msg) {

            File file = null;
            URL url;
            HttpURLConnection urlConnection = null;
            switch (msg.what) {
                case PROCESS_SAVED_IMAGE_MSG:
                    Log.d(TAG,"Processing file: "+msg.obj);
                    file = new File(msg.obj.toString());
                    try {
                        url = new URL("http://127.0.0.1:"+3000+"/api/post?url="+msg.obj);

                        urlConnection = (HttpURLConnection) url
                                .openConnection();

                        int responseCode = urlConnection.getResponseCode();
                        if (responseCode == HttpURLConnection.HTTP_OK) {
                            Log.d(TAG, "connect success ");
                        } else {
                            file.delete();
                        }
                    } catch (ConnectException e){
                        file.delete();
                        Log.v(TAG,"connect fail");
                    } catch (Exception e) {
                        file.delete();
                        urlConnection = null;
                        //e.printStackTrace();
                        Log.v(TAG,"Detector is not running");
                    } finally {
                        if (urlConnection != null) {
                            urlConnection.disconnect();
                            return true;
                        }
                    }
                    break;
                case START_POST_MSG:
                    TextureView textureView = (TextureView) findViewById(R.id.texture_view);
                    Bitmap bitmap = textureView.getBitmap();
                    String filename = "";

                    try {
                        file = screenshot.getInstance()
                                .saveScreenshotToPicturesFolder(MainActivity.this, bitmap, "frame_");

                        filename = file.getAbsolutePath();

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    Log.d(TAG, "file = " + filename);
                    //bitmap.recycle();
                    //bitmap = null;
                    if(filename.equals("")){
                        return false;
                    }
                    if(file == null){
                        return false;
                    }
                    try {
                        url = new URL("http://127.0.0.1:"+3000+"/api/post?url="+filename);

                        urlConnection = (HttpURLConnection) url
                                .openConnection();

                        int responseCode = urlConnection.getResponseCode();
                        if (responseCode == HttpURLConnection.HTTP_OK) {
                            Log.d(TAG, "connect success ");
                        } else {
                            file.delete();
                        }
                    } catch (ConnectException e){
                        file.delete();
                        Log.v(TAG,"connect fail");
                    } catch (Exception e) {
                        file.delete();
                        e.printStackTrace();
                    } finally {
                        if (urlConnection != null) {
                            urlConnection.disconnect();
                            return true;
                        }
                    }

                    break;

            }
            return true;
        }
    }




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);


        mTextureView = findViewById(R.id.texture_view);


        /**
         * 参数说明
         * 第一个参数为Context,第二个参数为KEY
         * 第三个参数为的textureView,用来显示视频画面
         * 第四个参数为一个ResultReceiver,用来接收SDK层发上来的事件通知;
         * 第五个参数为I420DataCallback,如果不为空,那底层会把YUV数据回调上来.
         */
        client = new EasyPlayerClient(this, BuildConfig.KEY, mTextureView, null, null);
        client.setAudioEnable(false);
        final EditText et = new EditText(this);
        et.setHint("请输入RTSP地址");
        final SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(this);
        et.setText(sp.getString("url","rtsp://admin:abc123@10.20.10.96:554/cam/realmonitor?channel=1&subtype=0"));


        new AlertDialog.Builder(this).setView(et).setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String url = et.getText().toString();
                if (!TextUtils.isEmpty(url)){
                    client.play(url);
                    sp.edit().putString("url", url).apply();

                    Timer timer = new Timer();
                    timer.schedule(new TimerTask() {
                        @Override
                        public void run() {
                            Log.e("lzp", "timer excute");
                            Bitmap bitmap= mTextureView.getBitmap();
                            String filename = "";
                            File file = null;

                            try {
                                file = screenshot.getInstance()
                                        .saveScreenshotToPicturesFolder(MainActivity.this, bitmap, "frame_");

                                filename = file.getAbsolutePath();

                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                            if (bitmap != null) {
                                bitmap.recycle();
                                bitmap = null;
                            }
                            if(filename.equals("")){
                                return;
                            }
                            if(file == null){
                                return;
                            }
                            mBackgroundHandler.obtainMessage(PROCESS_SAVED_IMAGE_MSG, filename).sendToTarget();
                        }
                    }, 0, 250);

                }
            }
        }).setNegativeButton(android.R.string.cancel, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                finish();
            }
        }).show();

        //String url = et.getText().toString();
        //client.play(url);

        HandlerThread handlerThread = new HandlerThread("BackgroundThread");
        handlerThread.start();
        MyCallback callback = new MyCallback();
        mBackgroundHandler = new Handler(handlerThread.getLooper(), callback);

        ensureStoragePermissionGranted();

        View decorView = getWindow().getDecorView();
        // Hide the status bar.
        int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
        decorView.setSystemUiVisibility(uiOptions);
    }

    public boolean ensureStoragePermissionGranted() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
 == PackageManager.PERMISSION_GRANTED) {
                return true;
            } else {
                requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQUESTCODE_PERMISSION_STORAGE);
                return false;
            }
        } else {
            // Always granted before Android 6.0.
            return true;
        }
    }
}
