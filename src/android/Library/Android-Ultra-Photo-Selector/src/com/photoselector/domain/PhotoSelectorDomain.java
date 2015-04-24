package com.photoselector.domain;

import java.util.List;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Handler;
import android.os.Message;

import com.photoselector.controller.AlbumController;
import com.photoselector.model.AlbumModel;
import com.photoselector.model.PhotoModel;
import com.photoselector.ui.PhotoSelectorActivity.OnLocalAlbumListener;
import com.photoselector.ui.PhotoSelectorActivity.OnLocalReccentListener;

@SuppressLint("HandlerLeak")
public class PhotoSelectorDomain {

	private AlbumController albumController;

	public PhotoSelectorDomain(Context context) {
		albumController = new AlbumController(context);
	}

	public void getReccent(final OnLocalReccentListener listener) {
		final Handler handler = new Handler() {
			@SuppressWarnings("unchecked")
			@Override
			public void handleMessage(Message msg) {
				if (msg.arg1 == 0){
					listener.onPhotoLoaded((List<PhotoModel>) msg.obj);
				}
				else{
					listener.onPhotoAdded((List<PhotoModel>) msg.obj);
				}
			}
		};
		new Thread(new Runnable() {
			@Override
			public void run() {
				albumController.getCurrentNew(handler);
			}
		}).start();
	}

	/** ������������ */
	public void updateAlbum(final OnLocalAlbumListener listener) {
		final Handler handler = new Handler() {
			@SuppressWarnings("unchecked")
			@Override
			public void handleMessage(Message msg) {
				listener.onAlbumLoaded((List<AlbumModel>) msg.obj);
			}
		};
		new Thread(new Runnable() {
			@Override
			public void run() {
				List<AlbumModel> albums = albumController.getAlbums();
				Message msg = new Message();
				msg.obj = albums;
				handler.sendMessage(msg);
			}
		}).start();
	}

	/** ���������������������������� */
	public void getAlbum(final String name, final OnLocalReccentListener listener) {
		final Handler handler = new Handler() {
			@SuppressWarnings("unchecked")
			@Override
			public void handleMessage(Message msg) {
				if (msg.arg1 == 0){
					listener.onPhotoLoaded((List<PhotoModel>) msg.obj);
				}
				else{
					listener.onPhotoAdded((List<PhotoModel>) msg.obj);
				}
			}
		};
		new Thread(new Runnable() {
			@Override
			public void run() {
				albumController.getAlbumNew(name,handler);
			}
		}).start();
	}

}
