package com.synconset;

import java.io.Serializable;

public class ImageInfo implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	Integer order=0;
	Integer rotation=0;
	String path=null;
	
	public void setOrder(Integer order)
	{
		this.order=order;
	}
	public void setRotation(Integer rotation)
	{
		this.rotation=rotation;
	}
	public void setPath(String path)
	{
		this.path=path;
	}
	public Integer getOrder()
	{
		return order;
	}
	public Integer getRotation()
	{
		return rotation;
	}
	public String getPath()
	{
		return path;
	}

}
