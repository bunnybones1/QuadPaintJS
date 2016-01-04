uniform float time;
uniform float brightness;

attribute vec4 rgba;
attribute vec3 custom;

varying vec4 vrgba;

void main() {
	vrgba = rgba * vec4(brightness, brightness, brightness, 1.0);
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
	gl_Position = projectionMatrix * (mvPosition);
}