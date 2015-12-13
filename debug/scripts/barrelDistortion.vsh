uniform highp vec2 LensCenter;
uniform highp vec2 ScreenCenter;
uniform highp vec2 Scale;
uniform highp vec2 ScaleIn;
uniform highp vec4 HmdWarpParam;

highp vec2 HmdWarp(highp vec2 in01)	
{
   highp vec2 theta = (in01 - LensCenter) * ScaleIn; // Scales to [-1, 1]
   highp float rSq = theta.x * theta.x + theta.y * theta.y;
   highp vec2 theta1 = theta * (HmdWarpParam.x + HmdWarpParam.y * rSq + HmdWarpParam.z * rSq * rSq + HmdWarpParam.w * rSq * rSq * rSq);
   return LensCenter + Scale * theta1;
}

uniform float time;

attribute vec4 rgba;
attribute vec3 custom;

varying vec4 vrgba;

void main() {
	vrgba = rgba;
	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
	float relTime = time - custom.x;
	vec4 wave = vec4(
		custom.y * sin(relTime),
		custom.y * cos(relTime),
		custom.y * sin(relTime * 2.0),
		0.0
	);
	float randTime = mod(relTime, 1.0) * 60.0;
	vec4 shiver = vec4(
		custom.z * sin(100.0 + randTime),
		custom.z * cos(120.0 + randTime * 2.0),
		custom.z * sin(140.0 + randTime * 3.0),
		0.0
	);
	gl_Position = projectionMatrix * (mvPosition + wave + shiver);
	gl_Position.xy = (HmdWarp( (gl_Position.xy / gl_Position.w)*0.5+0.5 ) *2.0-1.0 ) * gl_Position.w;

}