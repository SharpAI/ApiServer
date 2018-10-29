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
import android.widget.TextView;
import android.widget.Toast;
import com.pedro.vlc.VlcListener;
import com.pedro.vlc.VlcVideoLibrary;

import java.io.File;
import java.util.Arrays;
import org.videolan.libvlc.MediaPlayer;

import com.example.screenshot.screenshot;
/**
 * Created by pedro on 25/06/17.
 */
public class MainActivity extends AppCompatActivity implements VlcListener, View.OnClickListener {

  private VlcVideoLibrary vlcVideoLibrary;
  private Button bStartStop;
  private EditText etEndpoint;

  private String[] options = new String[]{":fullscreen"};

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
      Log.d("onTimeUpdate", "onTimeUpdate = ");

      TextureView textureView = (TextureView) findViewById(R.id.textureView);
      Bitmap bitmap = textureView.getBitmap();

      try {
          File file = screenshot.getInstance()
                  .saveScreenshotToPicturesFolder(MainActivity.this, bitmap, "my_screenshot");
      } catch (Exception e) {
          e.printStackTrace();
      }

  }

  @Override
  public void onClick(View view) {

    if (!vlcVideoLibrary.isPlaying()) {
      //vlcVideoLibrary.play(etEndpoint.getText().toString());
      vlcVideoLibrary.play("rtsp://admin:abc123@10.20.10.96:554/cam/realmonitor?channel=1&subtype=0");
      bStartStop.setText(getString(R.string.stop_player));

    } else {
      vlcVideoLibrary.stop();
      bStartStop.setText(getString(R.string.start_player));
    }



  }
}
