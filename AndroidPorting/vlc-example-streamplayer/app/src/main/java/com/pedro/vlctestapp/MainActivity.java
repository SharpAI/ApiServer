package com.pedro.vlctestapp;

import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.PixelCopy;
import android.view.SurfaceView;
import android.view.TextureView;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import com.pedro.vlc.VlcListener;
import com.pedro.vlc.VlcVideoLibrary;

import java.io.File;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import org.videolan.libvlc.MediaPlayer;

import com.example.screenshot.screenshot;


import android.os.Handler;
import android.os.HandlerThread;
import android.os.Message;

/**
 * Created by pedro on 25/06/17.
 */
public class MainActivity extends AppCompatActivity implements VlcListener, View.OnClickListener {

  private VlcVideoLibrary vlcVideoLibrary;
  private Button bStartStop;
  private EditText etEndpoint;

  private String[] options = new String[]{":fullscreen"};

    private static final int START_POST_MSG = 1001;
    private Handler mBackgroundHandler;

    class MyCallback implements Handler.Callback {

        @Override
        public boolean handleMessage(Message msg) {
            switch (msg.what) {
                case START_POST_MSG:
                    Log.d("handleMessage", "file = " + msg.obj);

                    boolean ret = false;
                    URL url;
                    HttpURLConnection urlConnection = null;
                    try {
                        url = new URL("http://192.168.103.7:"+3000+"/api/post?url="+msg.obj);

                        urlConnection = (HttpURLConnection) url
                                .openConnection();

                        int responseCode = urlConnection.getResponseCode();
                        if (responseCode == HttpURLConnection.HTTP_OK) {
                            ret = true;
                            Log.d("connect ", "connect success ");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    } finally {
                        if (urlConnection != null) {
                            urlConnection.disconnect();
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
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    setContentView(R.layout.activity_main);
    SurfaceView surfaceView = (SurfaceView) findViewById(R.id.surfaceView);
    TextureView textureView = (TextureView) findViewById(R.id.textureView);

    bStartStop = (Button) findViewById(R.id.b_start_stop);
    bStartStop.setOnClickListener(this);
    etEndpoint = (EditText) findViewById(R.id.et_endpoint);
    vlcVideoLibrary = new VlcVideoLibrary(this, this, textureView);
    vlcVideoLibrary.setOptions(Arrays.asList(options));

    HandlerThread handlerThread = new HandlerThread("BackgroundThread");
    handlerThread.start();
    MyCallback callback = new MyCallback();
    mBackgroundHandler = new Handler(handlerThread.getLooper(), callback);
  }

  @Override
  public void onComplete() {
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
      Log.d("onTimeUpdate", "onTimeUpdate ");

      TextureView textureView = (TextureView) findViewById(R.id.textureView);
      Bitmap bitmap = textureView.getBitmap();

      try {
          File file = screenshot.getInstance()
                  .saveScreenshotToPicturesFolder(MainActivity.this, bitmap, "my_screenshot");

          mBackgroundHandler.obtainMessage(START_POST_MSG, file.getAbsolutePath()).sendToTarget();
      } catch (Exception e) {
          e.printStackTrace();
      }

  }

  @Override
  public void onClick(View view) {
      try {
        if (!vlcVideoLibrary.isPlaying()) {
          vlcVideoLibrary.play("rtsp://admin:abc123@10.20.10.96:554/cam/realmonitor?channel=1&subtype=0");
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





