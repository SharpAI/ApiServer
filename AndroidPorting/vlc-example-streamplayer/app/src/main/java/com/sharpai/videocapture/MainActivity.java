package com.sharpai.videocapture;

import android.Manifest;
import android.annotation.TargetApi;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.SurfaceTexture;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.Gravity;
import android.view.TextureView;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.Toast;
import com.sharpai.vlc.VlcListener;
import com.sharpai.vlc.VlcVideoLibrary;

import java.io.File;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;

import org.videolan.libvlc.MediaPlayer;

import com.example.screenshot.screenshot;


import android.os.Message;

/**
 * Created by sharpai on 25/06/17.
 */
public class MainActivity extends AppCompatActivity implements VlcListener, View.OnClickListener,
        TextureView.SurfaceTextureListener {

    private VlcVideoLibrary vlcVideoLibrary;
    private Button bStartStop;
    private EditText etEndpoint;
    private static final int REQUESTCODE_PERMISSION_STORAGE = 1234;
    private String[] options = new String[]{":fullscreen", "--sout-transcode-fps=5"};
    private TextureView mTextureView;
    private static final String TAG = MainActivity.class.getName();

    private static final int START_POST_MSG = 1001;
    private static final int PROCESS_SAVED_IMAGE_MSG = 1002;
    private long mStartTime = 0;// System.currentTimeMillis();
    private Handler mBackgroundHandler;

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

                    if (!vlcVideoLibrary.isPlaying()) {
                        return true;
                    }

                    Log.d(TAG, "file = " + msg.obj);

                    TextureView textureView = (TextureView) findViewById(R.id.textureView);
                    Bitmap bitmap = textureView.getBitmap();
                    String filename = "";

                    try {
                        file = screenshot.getInstance()
                                .saveScreenshotToPicturesFolder(MainActivity.this, bitmap, "frame_");

                        filename = file.getAbsolutePath();

                    } catch (Exception e) {
                        e.printStackTrace();
                    }

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
    public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
        Log.d(TAG,"onSurfaceTextureDestroyed");
        return true;
    }
    public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
        Log.d(TAG,"onSurfaceTextureAvailable");
        SurfaceTexture texture = mTextureView.getSurfaceTexture();
        // We configure the size of default buffer to be the size of camera
        // preview we want.
        texture.setDefaultBufferSize(1920,1080);

        vlcVideoLibrary = new VlcVideoLibrary(this, this, mTextureView.getSurfaceTexture());
        vlcVideoLibrary.setOptions(Arrays.asList(options));

        HandlerThread handlerThread = new HandlerThread("BackgroundThread");
        handlerThread.start();
        MyCallback callback = new MyCallback();
        mBackgroundHandler = new Handler(handlerThread.getLooper(), callback);

        ensureStoragePermissionGranted();

        View decorView = getWindow().getDecorView();
        // Hide the status bar.
        int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
        decorView.setSystemUiVisibility(uiOptions);


        SharedPreferences myPreferences
                = PreferenceManager.getDefaultSharedPreferences(this);

        String endPoint = myPreferences.getString(TAG, "rtsp://admin:abc123@10.20.10.96:554/cam/realmonitor?channel=1&subtype=0");
        etEndpoint.setText(endPoint);
    }

    public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
        Log.d(TAG,"onSurfaceTextureSizeChanged");
        // Ignored, Camera does all the work for us
    }
    private void processFrame(SurfaceTexture surface){

        Bitmap bmp= mTextureView.getBitmap();
        String filename = "";
        File file = null;

        try {
            file = screenshot.getInstance()
                    .saveScreenshotToPicturesFolder(MainActivity.this, bmp, "frame_");

            filename = file.getAbsolutePath();

        } catch (Exception e) {
            e.printStackTrace();
        }

        //bitmap.recycle();
        //bitmap = null;
        if(filename.equals("")){
            return;
        }
        if(file == null){
            return;
        }
        mBackgroundHandler.obtainMessage(START_POST_MSG, filename).sendToTarget();
        return;
        /*
        URL url;
        HttpURLConnection urlConnection = null;
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
        } catch (Exception e) {
            file.delete();
            urlConnection = null;
            e.printStackTrace();
        } finally {
            if (urlConnection != null) {
                urlConnection.disconnect();
            }
        }
        */
    }
    public void onSurfaceTextureUpdated(SurfaceTexture surface) {
        // Invoked every time there's a new Camera preview frame

        Log.d(TAG, "onSurfaceTextureUpdated");
        boolean needSaveFrame = false;
        long currentTime = System.currentTimeMillis();
        if(mStartTime == 0) {
            mStartTime = currentTime;
            needSaveFrame = true;
        } else if (currentTime - mStartTime > 200){
            needSaveFrame = true;
            mStartTime = currentTime;
        }
        if(needSaveFrame){
            long start = System.currentTimeMillis();
            processFrame(surface);
            long end = System.currentTimeMillis();
            Log.v(TAG,"time diff is "+(end-start));
        }
        //private long mStartTime = 0;// System.currentTimeMillis();
    }
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    setContentView(R.layout.activity_main);
    etEndpoint = findViewById(R.id.et_endpoint);
    mTextureView = findViewById(R.id.textureView);

      mTextureView.setSurfaceTextureListener(this);

    FrameLayout.LayoutParams params =
              new FrameLayout.LayoutParams(
                      1920,
                      1080,
                      Gravity.CENTER);
      mTextureView.setLayoutParams(params);


    bStartStop = (Button) findViewById(R.id.b_start_stop);
    bStartStop.setOnClickListener(this);


  }

    /** For processes to access shared internal storage (/sdcard) we need this permission. */
    @TargetApi(Build.VERSION_CODES.M)
    public boolean ensureStoragePermissionGranted() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
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
  @Override
  public void onComplete() {

      String endPoint = etEndpoint.getText().toString();

      SharedPreferences myPreferences
              = PreferenceManager.getDefaultSharedPreferences(this);

      SharedPreferences.Editor myEditor = myPreferences.edit();
      myEditor.putString(TAG, endPoint);
      myEditor.commit();

    Toast.makeText(this, "Playing", Toast.LENGTH_SHORT).show();
  }

  @Override
  public void onError() {
    Toast.makeText(this, "Error, make sure your endpoint is correct", Toast.LENGTH_SHORT).show();
    vlcVideoLibrary.stop();
    bStartStop.setText(getString(R.string.start_player));
  }

  @Override
  public void onTimeUpdate(MediaPlayer.Event event) {
      //Log.d(TAG, "onTimeUpdate ");

      //mBackgroundHandler.obtainMessage(START_POST_MSG, "").sendToTarget();
  }

  @Override
  public void onClick(View view) {
      try {
        if (!vlcVideoLibrary.isPlaying()) {
          String endPoint = etEndpoint.getText().toString();

          vlcVideoLibrary.play(endPoint);
          bStartStop.setText(getString(R.string.stop_player));

        } else {
          vlcVideoLibrary.stop();
          bStartStop.setText(getString(R.string.start_player));
        }
      } catch (Exception e) {
          e.printStackTrace();
      }
  }
}





