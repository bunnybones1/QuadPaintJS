QuadPaintJS
===========

An experimental geometric painting and animation program. 

A performance-oriented painting experience guides the development of this project.
The desired hardware to implement control will be a Wacom tablet and Korg Nanos.
This is based on an old program written in java.

Features:

    Wacom support (Bamboo)
    USB MIDI controller support (Browser Plugin)
    Paint strokes made from basic GL Strips
    Strokes are store in 2D cartesian space but rendered in spherical coordinate system
    Chronological layering
    GL blend modes per stroke
    Sphere Vertex Shader
    Deluxe Sphere Vertex Shader that support realtime animation
    Vertex Stream Channels
    	1	R   Red
		1	G   Blue
		1	B   Green
		1	A   Alpha
		2	XY  CenterCoordinate (XY)
		1   Z   Depth (Z)
		1	Th  Thickness
		1	Ss  Sin Speed
		1	Sa  Sin Amplitude
		1	Ja  Jitter Amplitude
		1	Bt  Birth Time


		12		Total

	Stroke Data
		Vertex Stream
		Blendmode

	Painting Data
		Stroke Data Stream

