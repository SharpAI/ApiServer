package me.nereo.multi_image_selector;

import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.util.ArrayList;

import me.nereo.multi_image_selector.bean.PhotoModel;

/**
 * Multi image selector
 * Created by Nereo on 2015/4/7.
 * Updated by nereo on 2016/1/19.
 * Updated by nereo on 2016/5/18.
 */
public class MultiImageSelectorActivity extends AppCompatActivity
        implements MultiImageSelectorFragment.Callback{

    // Single choice
    public static final int MODE_SINGLE = 0;
    // Multi choice
    public static final int MODE_MULTI = 1;

    /** Max image size，int，{@link #DEFAULT_IMAGE_SIZE} by default */
    public static final String EXTRA_SELECT_COUNT = "MAX_IMAGES";
    /** Select mode，{@link #MODE_MULTI} by default */
    public static final String EXTRA_SELECT_MODE = "select_count_mode";
    /** Whether show camera，true by default */
    public static final String EXTRA_SHOW_CAMERA = "show_camera";
    /** Result data set，ArrayList&lt;String&gt;*/
    public static final String EXTRA_RESULT = "select_result";
    /** Original data set */
    public static final String EXTRA_DEFAULT_SELECTED_LIST = "default_list";
    // Default image size
    private static final int DEFAULT_IMAGE_SIZE = 9;

    private ArrayList<String> resultList = new ArrayList<>();
    private Button mSubmitButton;
    private int mDefaultCount = DEFAULT_IMAGE_SIZE;

    public static final String EXTRA_DESIRED_WIDTH = "WIDTH";
    public static final String EXTRA_DESIRED_HEIGHT = "HEIGHT";
    public static final String EXTRA_DESIRED_QUALITY = "QUALITY";
    private int desiredWidth = 480;
    private int desiredHeight = 640;
    private int quality = 100;

    private ProgressDialog progress;

    public void setImageParams(int width, int height, int quality) {
        this.desiredWidth = width;
        this.desiredHeight = height;
        this.quality = quality;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTheme(R.style.MIS_NO_ACTIONBAR);
        setContentView(R.layout.mis_activity_default);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.BLACK);
        }

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        if(toolbar != null){
            setSupportActionBar(toolbar);
        }

        final ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
        }

        final Intent intent = getIntent();
        mDefaultCount = intent.getIntExtra(EXTRA_SELECT_COUNT, DEFAULT_IMAGE_SIZE);
        desiredWidth = intent.getIntExtra(EXTRA_DESIRED_WIDTH, 480);
        desiredHeight = intent.getIntExtra(EXTRA_DESIRED_HEIGHT, 640);
        quality = intent.getIntExtra(EXTRA_DESIRED_QUALITY, 100);
        final int mode = intent.getIntExtra(EXTRA_SELECT_MODE, MODE_MULTI);
        final boolean isShow = intent.getBooleanExtra(EXTRA_SHOW_CAMERA, false);
        if(mode == MODE_MULTI && intent.hasExtra(EXTRA_DEFAULT_SELECTED_LIST)) {
            resultList = intent.getStringArrayListExtra(EXTRA_DEFAULT_SELECTED_LIST);
        }

        mSubmitButton = (Button) findViewById(R.id.commit);
        if(mode == MODE_MULTI){
            updateDoneText(resultList);
            mSubmitButton.setVisibility(View.VISIBLE);
            mSubmitButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if(resultList != null && resultList.size() >0){
                        // Notify success
                        /*Intent data = new Intent();
                        data.putStringArrayListExtra(EXTRA_RESULT, resultList);
                        setResult(RESULT_OK, data);*/

                        progress.show();
                        ArrayList<PhotoModel> selected = new ArrayList<PhotoModel>();
                        for (String fileName: resultList) {
                            selected.add(new PhotoModel(fileName));
                        }
                        new ResizeImagesTask().execute(selected);
                    }else{
                        setResult(RESULT_CANCELED);
                        finish();
                    }
                }
            });
        }else{
            mSubmitButton.setVisibility(View.GONE);
        }

        if(savedInstanceState == null){
            Bundle bundle = new Bundle();
            bundle.putInt(MultiImageSelectorFragment.EXTRA_SELECT_COUNT, mDefaultCount);
            bundle.putInt(MultiImageSelectorFragment.EXTRA_SELECT_MODE, mode);
            bundle.putBoolean(MultiImageSelectorFragment.EXTRA_SHOW_CAMERA, isShow);
            bundle.putStringArrayList(MultiImageSelectorFragment.EXTRA_DEFAULT_SELECTED_LIST, resultList);

            getSupportFragmentManager().beginTransaction()
                    .add(R.id.image_grid, Fragment.instantiate(this, MultiImageSelectorFragment.class.getName(), bundle))
                    .commit();
        }

        progress = new ProgressDialog(this);
        progress.setTitle("图片处理中");
        progress.setMessage("图片处理中,　请稍候...");

    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                setResult(RESULT_CANCELED);
                finish();
                return true;
        }
        return super.onOptionsItemSelected(item);
    }

    /**
     * Update done button by select image data
     * @param resultList selected image data
     */
    private void updateDoneText(ArrayList<String> resultList){
        int size = 0;
        if(resultList == null || resultList.size()<=0){
            mSubmitButton.setText(R.string.mis_action_done);
            mSubmitButton.setEnabled(false);
        }else{
            size = resultList.size();
            mSubmitButton.setEnabled(true);
        }
        mSubmitButton.setText(getString(R.string.mis_action_button_string,
                getString(R.string.mis_action_done), size, mDefaultCount));
    }

    @Override
    public void onSingleImageSelected(String path) {
        /*Intent data = new Intent();
        resultList.add(path);
        data.putStringArrayListExtra(EXTRA_RESULT, resultList);
        setResult(RESULT_OK, data);
        finish();*/

        resultList.add(path);
        progress.show();
        ArrayList<PhotoModel> selected = new ArrayList<PhotoModel>();
        for (String fileName: resultList) {
            selected.add(new PhotoModel(fileName));
        }
        new ResizeImagesTask().execute(selected);
    }

    @Override
    public void onImageSelected(String path) {
        if(!resultList.contains(path)) {
            resultList.add(path);
        }
        updateDoneText(resultList);
    }

    @Override
    public void onImageUnselected(String path) {
        if(resultList.contains(path)){
            resultList.remove(path);
        }
        updateDoneText(resultList);
    }

    @Override
    public void onCameraShot(File imageFile) {
        if(imageFile != null) {
            // notify system the image has change
            sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(imageFile)));

            Intent data = new Intent();
            resultList.add(imageFile.getAbsolutePath());
            data.putStringArrayListExtra(EXTRA_RESULT, resultList);
            setResult(RESULT_OK, data);
            finish();
        }
    }

    private float calculateScale(int width, int height) {
        float widthScale = 1.0f;
        float heightScale = 1.0f;
        float scale = 1.0f;
        if (desiredWidth > 0 || desiredHeight > 0) {
            if (desiredHeight == 0 && desiredWidth < width) {
                scale = (float) desiredWidth / width;
            } else if (desiredWidth == 0 && desiredHeight < height) {
                scale = (float) desiredHeight / height;
            } else {
                if (desiredWidth > 0 && desiredWidth < width) {
                    widthScale = (float) desiredWidth / width;
                }
                if (desiredHeight > 0 && desiredHeight < height) {
                    heightScale = (float) desiredHeight / height;
                }
                if (widthScale < heightScale) {
                    scale = widthScale;
                } else {
                    scale = heightScale;
                }
            }
        }

        return scale;
    }

    private int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
        // Raw height and width of image
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {
            final int halfHeight = height / 2;
            final int halfWidth = width / 2;

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width larger than the requested height and width.
            while ((halfHeight / inSampleSize) > reqHeight && (halfWidth / inSampleSize) > reqWidth) {
                inSampleSize *= 2;
            }
        }

        return inSampleSize;
    }

    private int calculateNextSampleSize(int sampleSize) {
        double logBaseTwo = (int) (Math.log(sampleSize) / Math.log(2));
        return (int) Math.pow(logBaseTwo + 1, 2);
    }

    private class ResizeImagesTask extends AsyncTask<ArrayList<PhotoModel>, Void, ArrayList<String>> {
        private Exception asyncTaskError = null;

        @Override
        protected ArrayList<String> doInBackground(ArrayList<PhotoModel>... fileSets) {
            ArrayList<PhotoModel> fileNames = fileSets[0];
            Bitmap bmp = null;
            int rotate = 0;
            String filename = null;
            ArrayList<String> al = new ArrayList<String>();
            try {
                for (int i = 0; i < fileNames.size(); i++) {
                    fileNames.get(i).setOriginalPath(fileNames.get(i).getOriginalPath());
                    if (false/*i != fileNames.get(i).getOrder()*/) {
                        for (int j = 0; j < fileNames.size(); j++) {
                            if (i == fileNames.get(j).getOrder()) {
                                filename = fileNames.get(j).getOriginalPath();
                                rotate = fileNames.get(j).getRotation();
                                break;
                            }
                        }
                    } else {
                        filename = fileNames.get(i).getOriginalPath();
                        rotate = fileNames.get(i).getRotation();
                    }
                    int index = filename.lastIndexOf('.');
                    String ext = filename.substring(index);
                    filename = filename.replaceAll("file://", "");
                    File file = new File(filename);
                    if (ext.compareToIgnoreCase(".gif") != 0) {
                        BitmapFactory.Options options = new BitmapFactory.Options();
                        options.inSampleSize = 1;
                        options.inJustDecodeBounds = true;
                        BitmapFactory.decodeFile(file.getAbsolutePath(), options);
                        int width = options.outWidth;
                        int height = options.outHeight;
                        float scale = calculateScale(width, height);
                        if (scale < 1) {
                            int finalWidth = (int) (width * scale);
                            int finalHeight = (int) (height * scale);
                            int inSampleSize = calculateInSampleSize(options, finalWidth, finalHeight);
                            options = new BitmapFactory.Options();
                            options.inSampleSize = inSampleSize;
                            try {
                                try {
                                    bmp = this.tryToGetBitmap(file, options, rotate, true);
                                } catch (IOException e) {
                                    // TODO Auto-generated catch block
                                    e.printStackTrace();
                                }
                            } catch (OutOfMemoryError e) {
                                options.inSampleSize = calculateNextSampleSize(options.inSampleSize);
                                try {
                                    try {
                                        bmp = this.tryToGetBitmap(file, options, rotate, false);
                                    } catch (IOException e1) {
                                        // TODO Auto-generated catch block
                                        e1.printStackTrace();
                                    }
                                } catch (OutOfMemoryError e2) {
                                    throw new IOException("Unable to load image into memory.");
                                }
                            }
                        } else {
                            try {
                                bmp = this.tryToGetBitmap(file, null, rotate, false);
                            } catch (OutOfMemoryError e) {
                                options = new BitmapFactory.Options();
                                options.inSampleSize = 2;
                                try {
                                    bmp = this.tryToGetBitmap(file, options, rotate, false);
                                } catch (OutOfMemoryError e2) {
                                    options = new BitmapFactory.Options();
                                    options.inSampleSize = 4;
                                    try {
                                        bmp = this.tryToGetBitmap(file, options, rotate, false);
                                    } catch (OutOfMemoryError e3) {
                                        throw new IOException("Unable to load image into memory.");
                                    }
                                }
                            }
                        }
                        file = this.storeImage(bmp, file.getName());
                        al.add(Uri.fromFile(file).toString());
                    } else {
                        file = this.copyImage(file);
                        al.add(Uri.fromFile(file).toString());
                    }
                }

                return al;
            } catch (IOException e) {
                try {
                    asyncTaskError = e;
                    for (int i = 0; i < al.size(); i++) {
                        URI uri = new URI(al.get(i));
                        File file = new File(uri);
                        file.delete();
                    }
                } catch (Exception exception) {
                    // the finally does what we want to do
                } finally {
                    return new ArrayList<String>();
                }
            }
        }

        @Override
        protected void onPostExecute(ArrayList<String> al) {
            Intent data = new Intent();

            if (asyncTaskError != null) {
                Bundle res = new Bundle();
                res.putString("ERRORMESSAGE", asyncTaskError.getMessage());
                data.putExtras(res);
                setResult(RESULT_CANCELED, data);
            } else if (al.size() > 0) {
                Bundle res = new Bundle();
                res.putStringArrayList("MULTIPLEFILENAMES", al);
                if (resultList != null) {
                    res.putInt("TOTALFILES", resultList.size());
                }
                data.putExtras(res);
                setResult(RESULT_OK, data);
            } else {
                setResult(RESULT_CANCELED, data);
            }
            progress.dismiss();
            finish();
        }

        private Bitmap tryToGetBitmap(File file, BitmapFactory.Options options, int rotate, boolean shouldScale) throws IOException, OutOfMemoryError {
            Bitmap bmp;
            if (options == null) {
                bmp = BitmapFactory.decodeFile(file.getAbsolutePath());
            } else {
                bmp = BitmapFactory.decodeFile(file.getAbsolutePath(), options);
            }
            if (bmp == null) {
                throw new IOException("The image file could not be opened.");
            }
            if (options != null && shouldScale) {
                float scale = calculateScale(options.outWidth, options.outHeight);
                bmp = this.getResizedBitmap(bmp, scale);
            }
            if (rotate != 0) {
                Matrix matrix = new Matrix();
                matrix.setRotate(rotate);
                bmp = Bitmap.createBitmap(bmp, 0, 0, bmp.getWidth(), bmp.getHeight(), matrix, true);
            }
            return bmp;
        }

        /*
        * The following functions are originally from
        * https://github.com/raananw/PhoneGap-Image-Resizer
        *
        * They have been modified by Andrew Stephan for Sync OnSet
        *
        * The software is open source, MIT Licensed.
        * Copyright (C) 2012, webXells GmbH All Rights Reserved.
        */
        private File storeImage(Bitmap bmp, String fileName) throws IOException {
            int index = fileName.lastIndexOf('.');
            String name = "Temp_" + fileName.substring(0, index).replaceAll("([^a-zA-Z0-9])", "");
            String ext = fileName.substring(index);
            File file = File.createTempFile(name, ext);
            OutputStream outStream = new FileOutputStream(file);
            bmp.compress(Bitmap.CompressFormat.JPEG, quality, outStream);
            outStream.flush();
            outStream.close();
            return file;
        }

        private File copyImage(File srcfile) throws IOException {
            byte[] buf = new byte[4 * 1024];
            int b = 0;
            String fileName = srcfile.getName();
            int index = fileName.lastIndexOf('.');
            String name = "Temp_" + fileName.substring(0, index).replaceAll("([^a-zA-Z0-9])", "");
            String ext = fileName.substring(index);
            File file = File.createTempFile(name, ext);

            OutputStream outStream = new FileOutputStream(file);
            FileInputStream inStream = new FileInputStream(srcfile.getAbsolutePath());
            while ((b = inStream.read(buf, 0, buf.length)) != -1) {
                outStream.write(buf, 0, b);
                outStream.flush();
            }
            outStream.flush();
            outStream.close();
            inStream.close();
            return file;
        }

        private Bitmap getResizedBitmap(Bitmap bm, float factor) {
            int width = bm.getWidth();
            int height = bm.getHeight();
            // create a matrix for the manipulation
            Matrix matrix = new Matrix();
            // resize the bit map
            matrix.postScale(factor, factor);
            // recreate the new Bitmap
            Bitmap resizedBitmap = Bitmap.createBitmap(bm, 0, 0, width, height, matrix, false);
            return resizedBitmap;
        }
    }
}
